<?php

use Illuminate\Support\Facades\Route;
use Modules\Venue\Http\Controllers\Api\VenueDeleteController;
use Modules\Venue\Http\Controllers\Api\VenueListController;
use Modules\Venue\Http\Controllers\Api\VenueShowController;
use Modules\Venue\Http\Controllers\Api\VenueTypeListController;
use Modules\Venue\Http\Controllers\Api\VenueUpdateController;

Route::prefix('v1')->group(function () {
    Route::get('venues', VenueListController::class)->name('venues.index');
    Route::get('venues/{venue}', VenueShowController::class)->name('venues.show');
    Route::get('venue-types', VenueTypeListController::class)->name('venue-types.index');

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::put('venues/{venue}', VenueUpdateController::class)->name('venues.update');
        Route::patch('venues/{venue}', VenueUpdateController::class);
        Route::delete('venues/{venue}', VenueDeleteController::class)->name('venues.destroy');
    });
});
