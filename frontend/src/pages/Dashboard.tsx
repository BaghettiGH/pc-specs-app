import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { SpecCard } from '../components/SpecCard';
import { api } from '../services/api';
import { 
    LogOut, Eye, Trash2, ShieldAlert, UploadCloud, Cpu, Layers, HardDrive, Laptop, List, UserCheck, Edit2, X, Check
} from 'lucide-react';

interface Specification {
    id: number;
    employee_name: string;
    employee_email: string;
    device_name: string;
    serial_number: string;
    cpu: string | null;
    ram: string | null;
    storage: string | null;
    gpu: string | null;
    os: string | null;
    status: string | null;
    created_at: string;
}

interface DeployedHardwareItem {
    name: string;
    count: number;
    hosts: string[];
}

interface EmployeeRecord {
    name: string;
    email: string;
    devices: { id: number; name: string; serial: string }[];
}

export function Dashboard() {
    const { logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);
    
    // Inventory states
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [fetchingSpecs, setFetchingSpecs] = useState(false);
    const [selectedSpec, setSelectedSpec] = useState<Specification | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    
    // Navigation state within Dashboard
    const [activeSubTab, setActiveSubTab] = useState<'allocations' | 'catalog' | 'employees'>('allocations');
    
    // Employee Edit States
    const [editingEmployee, setEditingEmployee] = useState<{ old_email: string; name: string; email: string } | null>(null);
    const [savingEmployee, setSavingEmployee] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Drag and drop states
    const [isDragging, setIsDragging] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setLoggingOut(false);
        }
    };

    // Load specifications from server
    const loadSpecifications = async () => {
        setFetchingSpecs(true);
        try {
            const response = await api.get('/api/specifications');
            setSpecifications(response.data);
        } catch (err) {
            console.error('Failed to load specifications:', err);
        } finally {
            setFetchingSpecs(false);
        }
    };

    useEffect(() => {
        loadSpecifications();
    }, []);

    const handleDeleteSpec = async (id: number) => {
        if (!confirm('Are you sure you want to delete this computer specification record?')) {
            return;
        }
        try {
            await api.delete(`/api/specifications/${id}`);
            setToastMessage('Record deleted successfully.');
            loadSpecifications();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete record.');
        }
    };

    // Employee Edit API Submit
    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;
        setSavingEmployee(true);
        setEditError(null);

        try {
            const response = await api.put('/api/employees/update', {
                old_email: editingEmployee.old_email,
                name: editingEmployee.name,
                email: editingEmployee.email
            });
            setToastMessage(response.data.message || 'Employee updated successfully.');
            setEditingEmployee(null);
            loadSpecifications();
        } catch (err: any) {
            setEditError(err.response?.data?.message || 'Failed to update employee details.');
        } finally {
            setSavingEmployee(false);
        }
    };

    // Employee Bulk Delete
    const handleDeleteEmployee = async (email: string) => {
        if (!confirm(`Are you sure you want to remove this employee and all associated allocated hardware assets?`)) {
            return;
        }
        try {
            const response = await api.delete(`/api/employees?email=${encodeURIComponent(email)}`);
            setToastMessage(response.data.message || 'Employee allocations deleted.');
            loadSpecifications();
        } catch (err) {
            console.error('Failed to delete employee:', err);
            alert('Failed to delete employee profile.');
        }
    };

    // Auto-dismiss toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        }
        return;
    }, [toastMessage]);

    // Drag and Drop Logic
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const processFile = (file: File) => {
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setToastMessage('Invalid file type. Please drop a valid .json file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            try {
                const parsed = JSON.parse(text);
                const payload = Array.isArray(parsed) ? parsed : [parsed];
                
                const response = await api.post('/api/specifications/import', payload);
                setToastMessage(response.data.message || 'Specifications imported successfully.');
                loadSpecifications();
            } catch (err: any) {
                const msg = err.response?.data?.message || err.message || 'Failed to import JSON data.';
                setToastMessage(`Error: ${msg}`);
            }
        };
        reader.onerror = () => {
            setToastMessage('Failed to read file.');
        };
        reader.readAsText(file);
    };

    const totalDevices = specifications.length;

    // --- Dynamic Hardware Catalog Aggregation ---
    
    // 1. CPUs
    const cpuCatalog = specifications.reduce((acc, spec) => {
        if (!spec.cpu) return acc;
        const match = acc.find(item => item.name === spec.cpu);
        if (match) {
            match.count++;
            if (!match.hosts.includes(spec.employee_name)) {
                match.hosts.push(spec.employee_name);
            }
        } else {
            acc.push({ name: spec.cpu, count: 1, hosts: [spec.employee_name] });
        }
        return acc;
    }, [] as DeployedHardwareItem[]);

    // 2. Motherboards
    const motherboardCatalog = specifications.reduce((acc, spec) => {
        if (!spec.device_name) return acc;
        const match = acc.find(item => item.name === spec.device_name);
        if (match) {
            match.count++;
            if (!match.hosts.includes(spec.employee_name)) {
                match.hosts.push(spec.employee_name);
            }
        } else {
            acc.push({ name: spec.device_name, count: 1, hosts: [spec.employee_name] });
        }
        return acc;
    }, [] as DeployedHardwareItem[]);

    // 3. RAM Configurations
    const ramCatalog = specifications.reduce((acc, spec) => {
        if (!spec.ram) return acc;
        const match = acc.find(item => item.name === spec.ram);
        if (match) {
            match.count++;
            if (!match.hosts.includes(spec.employee_name)) {
                match.hosts.push(spec.employee_name);
            }
        } else {
            acc.push({ name: spec.ram, count: 1, hosts: [spec.employee_name] });
        }
        return acc;
    }, [] as DeployedHardwareItem[]);

    // 4. Storage Drives (split by '+' to separate physical drives)
    const storageCatalog = specifications.reduce((acc, spec) => {
        if (!spec.storage) return acc;
        const drives = spec.storage.split(' + ');
        drives.forEach(drive => {
            const driveClean = drive.trim();
            if (!driveClean) return;
            const match = acc.find(item => item.name === driveClean);
            if (match) {
                match.count++;
                if (!match.hosts.includes(spec.employee_name)) {
                    match.hosts.push(spec.employee_name);
                }
            } else {
                acc.push({ name: driveClean, count: 1, hosts: [spec.employee_name] });
            }
        });
        return acc;
    }, [] as DeployedHardwareItem[]);

    // --- Dynamic Employee Profiles Directory Aggregation ---
    const employeeCatalog = specifications.reduce((acc, spec) => {
        const email = spec.employee_email || 'unknown@company.com';
        const name = spec.employee_name || 'Unknown Employee';
        const match = acc.find(item => item.email.toLowerCase() === email.toLowerCase());
        if (match) {
            match.devices.push({ id: spec.id, name: spec.device_name, serial: spec.serial_number });
        } else {
            acc.push({
                name,
                email,
                devices: [{ id: spec.id, name: spec.device_name, serial: spec.serial_number }]
            });
        }
        return acc;
    }, [] as EmployeeRecord[]);

    return (
        <div className="w-full max-w-5xl px-4 animate-fade-in-up flex flex-col gap-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 bg-clip-text text-transparent">
                        Hardware Inventory Portal
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Drag and drop a configurations JSON file to load and display system specification sheets
                    </p>
                </div>
                <Button variant="secondary" loading={loggingOut} onClick={handleLogout} className="self-start md:self-auto gap-2 bg-white text-slate-800 hover:bg-slate-50 border-slate-200">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>

            {/* Notification Toast */}
            {toastMessage && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in-up flex justify-between items-center z-20">
                    <span>{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="text-blue-500 hover:text-blue-800 focus:outline-none">Dismiss</button>
                </div>
            )}

            {/* Drag & Drop File Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('json-file-input')?.click()}
                className={`glass-panel p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isDragging 
                        ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
                }`}
            >
                {/* Visual top light bar */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
                
                <input 
                    type="file" 
                    id="json-file-input" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleFileSelect} 
                />

                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
                    isDragging 
                        ? 'bg-blue-500 border-blue-500 text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                        : 'bg-slate-100 border-slate-200 text-blue-600'
                }`}>
                    <UploadCloud className="h-7 w-7" />
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 text-base">Drag & Drop Specifications JSON</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Drop a valid <code>.json</code> specifications file here, or click to browse.
                    </p>
                </div>
            </div>

            {totalDevices > 0 && (
                <>
                    {/* Navigation Sub-Tabs */}
                    <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold mt-2">
                        <button
                            onClick={() => setActiveSubTab('allocations')}
                            className={`pb-3 flex items-center gap-2 border-b-2 transition-all focus:outline-none ${
                                activeSubTab === 'allocations' 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <List className="h-4 w-4" />
                            Employee Allocations ({totalDevices})
                        </button>
                        <button
                            onClick={() => setActiveSubTab('catalog')}
                            className={`pb-3 flex items-center gap-2 border-b-2 transition-all focus:outline-none ${
                                activeSubTab === 'catalog' 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Cpu className="h-4 w-4" />
                            Hardware Catalog
                        </button>
                        <button
                            onClick={() => setActiveSubTab('employees')}
                            className={`pb-3 flex items-center gap-2 border-b-2 transition-all focus:outline-none ${
                                activeSubTab === 'employees' 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <UserCheck className="h-4 w-4" />
                            Employee Directory ({employeeCatalog.length})
                        </button>
                    </div>

                    {/* Sub-Tab Contents */}
                    {activeSubTab === 'allocations' ? (
                        /* Allocations logs list */
                        <div className="glass-panel p-6 rounded-2xl relative flex flex-col gap-4">
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Asset Allocation Logs</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Database records of employee hardware allocations</p>
                            </div>

                            {fetchingSpecs ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                                    <span className="text-xs text-slate-500">Loading specs database...</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider font-mono text-[10px]">
                                                <th className="py-2.5 px-3">Employee Name</th>
                                                <th className="py-2.5 px-3">Device Model (Motherboard)</th>
                                                <th className="py-2.5 px-3">Computer Key (Serial)</th>
                                                <th className="py-2.5 px-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {specifications.map((spec) => (
                                                <tr key={spec.id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                                                    <td className="py-3.5 px-3">
                                                        <span className="font-bold text-slate-800 block leading-tight">{spec.employee_name}</span>
                                                        <span className="text-[10px] text-slate-400">{spec.employee_email}</span>
                                                    </td>
                                                    <td className="py-3.5 px-3 font-medium text-slate-600">{spec.device_name}</td>
                                                    <td className="py-3.5 px-3 font-mono text-[10px] text-blue-600 font-semibold">{spec.serial_number}</td>
                                                    <td className="py-3.5 px-3 text-right flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedSpec(spec)}
                                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                                                            title="View Spec Sheet"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSpec(spec.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : activeSubTab === 'catalog' ? (
                        /* Deployed physical hardware catalog view (scrollable lists, no cutoff) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Deployed CPUs */}
                            <div className="glass-panel p-5 rounded-2xl relative flex flex-col gap-4 h-[430px]">
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center">
                                        <Cpu className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">Processors (CPUs)</h3>
                                        <p className="text-[10px] text-slate-400">Deployed central processors</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2">
                                    {cpuCatalog.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2 text-xs">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="font-bold text-slate-700 leading-snug break-words">{item.name}</span>
                                                <span className="shrink-0 bg-blue-100 border border-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                                    {item.count} Deployed
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                                <span>Hosts:</span>
                                                {item.hosts.map((host, hIdx) => (
                                                    <span key={hIdx} className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-medium font-mono">
                                                        {host}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deployed Motherboards */}
                            <div className="glass-panel p-5 rounded-2xl relative flex flex-col gap-4 h-[430px]">
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-500 border border-purple-100 flex items-center justify-center">
                                        <Laptop className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">Motherboards / Devices</h3>
                                        <p className="text-[10px] text-slate-400">Recorded hardware products</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2">
                                    {motherboardCatalog.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2 text-xs">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="font-bold text-slate-700 leading-snug break-words">{item.name}</span>
                                                <span className="shrink-0 bg-purple-100 border border-purple-200 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                                    {item.count} Deployed
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                                <span>Hosts:</span>
                                                {item.hosts.map((host, hIdx) => (
                                                    <span key={hIdx} className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-medium font-mono">
                                                        {host}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deployed RAM configurations */}
                            <div className="glass-panel p-5 rounded-2xl relative flex flex-col gap-4 h-[430px]">
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">Memory Blocks (RAM)</h3>
                                        <p className="text-[10px] text-slate-400">Deployed dynamic RAM quantities</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2">
                                    {ramCatalog.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2 text-xs">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="font-bold text-slate-700 leading-snug break-words">{item.name} Configurations</span>
                                                <span className="shrink-0 bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                                    {item.count} Deployed
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                                <span>Hosts:</span>
                                                {item.hosts.map((host, hIdx) => (
                                                    <span key={hIdx} className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-medium font-mono">
                                                        {host}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deployed Storage Drives */}
                            <div className="glass-panel p-5 rounded-2xl relative flex flex-col gap-4 h-[430px]">
                                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                                        <HardDrive className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">Storage Drives (SSD / HDD)</h3>
                                        <p className="text-[10px] text-slate-400">Recorded physical disks</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2">
                                    {storageCatalog.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2 text-xs">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="font-bold text-slate-700 leading-snug break-words">{item.name}</span>
                                                <span className="shrink-0 bg-red-100 border border-red-200 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                                    {item.count} Deployed
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                                <span>Hosts:</span>
                                                {item.hosts.map((host, hIdx) => (
                                                    <span key={hIdx} className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-medium font-mono">
                                                        {host}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    ) : (
                        /* Employee Directory management tab view */
                        <div className="glass-panel p-6 rounded-2xl relative flex flex-col gap-4">
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Employee Asset Directory</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Manage corporate employees and edit profile details</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider font-mono text-[10px]">
                                            <th className="py-2.5 px-3">Employee Details</th>
                                            <th className="py-2.5 px-3">Assigned Asset Allocation Keys</th>
                                            <th className="py-2.5 px-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {employeeCatalog.map((emp, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                                                <td className="py-3.5 px-3">
                                                    <span className="font-bold text-slate-800 block leading-tight">{emp.name}</span>
                                                    <span className="text-[10px] text-slate-400">{emp.email}</span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                                                        {emp.devices.map(d => (
                                                            <span key={d.id} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2 py-0.5 text-blue-700 font-mono text-[10px] w-fit font-semibold">
                                                                <Laptop className="h-3 w-3 text-blue-500" />
                                                                {d.name} ({d.serial})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3 text-right flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setEditingEmployee({ old_email: emp.email, name: emp.name, email: emp.email })}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                                                        title="Edit Profile"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEmployee(emp.email)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                        title="Delete Employee & Assets"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {totalDevices === 0 && !fetchingSpecs && (
                <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50/50">
                    <ShieldAlert className="h-10 w-10 text-slate-300" />
                    <div>
                        <h3 className="font-semibold text-slate-700">No Inventory Found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            The specifications list is currently empty. Drop a config <code>.json</code> file above to allocate hardware inventory sheets.
                        </p>
                    </div>
                </div>
            )}

            {/* SpecCard Popup Overlay */}
            {selectedSpec && (
                <SpecCard 
                    specification={selectedSpec}
                    onClose={() => setSelectedSpec(null)}
                />
            )}

            {/* Edit Employee Modal Overlay */}
            {editingEmployee && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-sm rounded-3xl flex flex-col relative overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />

                        <div className="flex justify-between items-center p-5 border-b border-slate-200 shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Edit Employee Profile</h3>
                                <p className="text-[10px] text-slate-400">Updates all allocated device sheets</p>
                            </div>
                            <button
                                onClick={() => setEditingEmployee(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-xl"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateEmployee} className="p-5 flex flex-col gap-4">
                            {editError && (
                                <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold">
                                    {editError}
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Employee Name</label>
                                <input
                                    type="text"
                                    className="w-full glass-input p-2 rounded-lg text-xs"
                                    value={editingEmployee.name}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Employee Email</label>
                                <input
                                    type="email"
                                    className="w-full glass-input p-2 rounded-lg text-xs"
                                    value={editingEmployee.email}
                                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end mt-2">
                                <Button type="button" variant="secondary" onClick={() => setEditingEmployee(null)} className="text-xs">
                                    Cancel
                                </Button>
                                <Button type="submit" loading={savingEmployee} className="gap-1 bg-blue-600 hover:bg-blue-500 text-xs">
                                    <Check className="h-4.5 w-4.5" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
