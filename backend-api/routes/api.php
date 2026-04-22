<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/queues', [QueueController::class, 'index']);
Route::get('/queues/current', [QueueController::class, 'current']);
Route::middleware('throttle:10,1')->post('/queues', [QueueController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/queues/{id}/status', [QueueController::class, 'updateStatus']);
});



