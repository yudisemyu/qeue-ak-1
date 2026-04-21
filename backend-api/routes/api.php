<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QueueController;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route ::post('/login', [AuthController::class, 'login']);
Route::middleware('throttle:3,1')->post('/queues', [QueueController::class, 'store']);
Route::post('/queues', [QueueController::class, 'store']);
Route::get('/queues', [QueueController::class, 'index']);
Route::get('/queues/current', [QueueController::class, 'current']);
Route::patch('/queues/{id}/status', [QueueController::class, 'updateStatus']);