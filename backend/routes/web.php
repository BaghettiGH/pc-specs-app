<?php

use Illuminate\Support\Facades\Route;

// Redirect main root URL to the frontend development server
Route::redirect('/', 'http://localhost:5173');

// Web route fallback
Route::fallback(function () {
    return response()->json([
        'message' => 'Secure Auth API Backend is running. Please access endpoints under /api.',
        'frontend_url' => 'http://localhost:5173'
    ], 200);
});
