<?php

namespace Modules\Venue\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;

class VenueShowController extends Controller
{
    public function __invoke(Venue $venue): JsonResponse
    {
        return response()->json([
            'data' => $this->formatVenue($venue),
        ]);
    }

    private function formatVenue(Venue $venue): array
    {
        return [
            'id' => (int) $venue->id,
            'status' => Venue::statusLabel((int) $venue->status),
            'name' => $venue->name,
            'address' => $venue->address,
            'latitude' => $venue->latitude !== null ? (float) $venue->latitude : null,
            'longitude' => $venue->longitude !== null ? (float) $venue->longitude : null,
            'seat_count' => (int) $venue->seat_count,
            'people_count' => (int) $venue->people_count,
            'rating' => $venue->rating !== null ? (float) $venue->rating : null,
            'rating_count' => (int) $venue->rating_count,
            'price_level' => (int) $venue->price_level,
            'city_id' => (int) $venue->city_id,
            'venue_type_id' => (int) $venue->venue_type_id,
        ];
    }
}
