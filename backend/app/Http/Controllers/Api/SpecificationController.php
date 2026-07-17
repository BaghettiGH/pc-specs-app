<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComputerSpecification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SpecificationController extends Controller
{
    /**
     * Retrieve all computer specification records.
     */
    public function index()
    {
        return response()->json(
            ComputerSpecification::orderBy('employee_name')->get()
        );
    }

    /**
     * Import a JSON object or array of computer specifications.
     * Maps the custom motherboard, cpu, ram array, storage array, and gpu layout.
     * This will perform an upsert based on the unique computer name (serial_number).
     */
    public function import(Request $request)
    {
        $items = $request->all();

        // If it's a single object, wrap it in an array for consistent processing
        if (is_array($items) && isset($items['Computer'])) {
            $items = [$items];
        }

        // Ensure the payload is a list/array
        if (!is_array($items) || (count($items) > 0 && array_keys($items) !== range(0, count($items) - 1))) {
            return response()->json([
                'message' => 'Invalid data format. Expected a JSON object or JSON array of objects.'
            ], 422);
        }

        if (count($items) === 0) {
            return response()->json([
                'message' => 'No items were provided in the import payload.'
            ], 422);
        }

        // Validate each item
        foreach ($items as $index => $item) {
            $validator = Validator::make($item, [
                'Computer.Name' => 'required|string|max:255',
                'Motherboard.Product' => 'nullable|string|max:255',
                'CPU.Name' => 'nullable|string|max:255',
                'RAM' => 'nullable|array',
                'RAM.*.CapacityGB' => 'nullable|numeric',
                'Storage' => 'nullable|array',
                'Storage.*.Model' => 'nullable|string|max:255',
                'Storage.*.SizeGB' => 'nullable|numeric',
                'GPU.Name' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => "Validation failed for item at index {$index}.",
                    'errors' => $validator->errors()
                ], 422);
            }
        }

        // Upsert items into database
        $importedCount = 0;
        foreach ($items as $item) {
            $computerName = $item['Computer']['Name'];
            
            // 1. Calculate RAM Sum
            $ramVal = 0;
            if (isset($item['RAM']) && is_array($item['RAM'])) {
                foreach ($item['RAM'] as $ramItem) {
                    $ramVal += $ramItem['CapacityGB'] ?? 0;
                }
            }
            $ram = $ramVal > 0 ? "{$ramVal} GB" : null;

            // 2. Format Storage List
            $storageParts = [];
            if (isset($item['Storage']) && is_array($item['Storage'])) {
                foreach ($item['Storage'] as $storageItem) {
                    $model = $storageItem['Model'] ?? 'Generic Drive';
                    $size = isset($storageItem['SizeGB']) ? round($storageItem['SizeGB']) . ' GB' : '';
                    $storageParts[] = $model . ($size ? " ({$size})" : "");
                }
            }
            $storage = count($storageParts) > 0 ? implode(' + ', $storageParts) : null;

            // 3. Extract other details
            $employeeName = $computerName;
            $employeeEmail = strtolower(str_replace(' ', '', $computerName)) . '@company.com';
            $deviceName = $item['Motherboard']['Product'] ?? 'Unknown Motherboard';
            $cpu = $item['CPU']['Name'] ?? null;
            $gpu = $item['GPU']['Name'] ?? null;
            
            // Identify OS based on CPU name
            $os = 'Windows';
            if (stripos($cpu ?? '', 'apple') !== false || stripos($cpu ?? '', 'm1') !== false || stripos($cpu ?? '', 'm2') !== false || stripos($cpu ?? '', 'm3') !== false) {
                $os = 'macOS';
            }

            ComputerSpecification::updateOrCreate(
                ['serial_number' => $computerName],
                [
                    'employee_name' => $employeeName,
                    'employee_email' => $employeeEmail,
                    'device_name' => $deviceName,
                    'cpu' => $cpu,
                    'ram' => $ram,
                    'storage' => $storage,
                    'gpu' => $gpu,
                    'os' => $os,
                    'status' => 'Assigned',
                ]
            );
            $importedCount++;
        }

        return response()->json([
            'message' => "Successfully imported {$importedCount} specification records."
        ]);
    }

    /**
     * Delete a specification record by ID.
     */
    public function destroy($id)
    {
        $spec = ComputerSpecification::find($id);

        if (!$spec) {
            return response()->json([
                'message' => 'Record not found.'
            ], 404);
        }

        $spec->delete();

        return response()->json([
            'message' => 'Specification record deleted successfully.'
        ]);
    }

    /**
     * Update employee details (name, email) across all specifications.
     */
    public function updateEmployee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'old_email' => 'required|email|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $oldEmail = $request->input('old_email');
        $newName = $request->input('name');
        $newEmail = $request->input('email');

        $updatedCount = ComputerSpecification::where('employee_email', $oldEmail)
            ->update([
                'employee_name' => $newName,
                'employee_email' => $newEmail
            ]);

        return response()->json([
            'message' => "Successfully updated employee details for {$updatedCount} asset allocations."
        ]);
    }

    /**
     * Delete an employee and all associated specification allocations.
     */
    public function destroyEmployee(Request $request)
    {
        $email = $request->query('email');

        if (!$email) {
            return response()->json([
                'message' => 'Employee email parameter is required.'
            ], 400);
        }

        $deletedCount = ComputerSpecification::where('employee_email', $email)->delete();

        return response()->json([
            'message' => "Successfully removed employee and deleted {$deletedCount} associated allocations."
        ]);
    }
}
