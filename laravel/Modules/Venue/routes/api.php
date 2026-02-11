<?php

use Illuminate\Support\Facades\Route;
use Modules\Venue\Http\Controllers\Api\VenueListController;

Route::prefix('v1')->group(function () {
    Route::get('venues', VenueListController::class)->name('venues.index');
});
