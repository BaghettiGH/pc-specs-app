<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SpecificationController;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated session routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Inventory routes
    Route::get('/specifications', [SpecificationController::class, 'index']);
    Route::post('/specifications/import', [SpecificationController::class, 'import']);
    Route::delete('/specifications/{id}', [SpecificationController::class, 'destroy']);
    
    // Employee management routes
    Route::put('/employees/update', [SpecificationController::class, 'updateEmployee']);
    Route::delete('/employees', [SpecificationController::class, 'destroyEmployee']);
});
