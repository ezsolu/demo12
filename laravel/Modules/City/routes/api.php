<?php

use Illuminate\Support\Facades\Route;
use Modules\City\Http\Controllers\Api\CityListController;
use Modules\City\Http\Controllers\CityController;

Route::prefix('v1')->group(function () {
    Route::get('cities', CityListController::class)->name('cities.index');

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::apiResource('cities', CityController::class)->names('city')->except(['index']);
    });
});
