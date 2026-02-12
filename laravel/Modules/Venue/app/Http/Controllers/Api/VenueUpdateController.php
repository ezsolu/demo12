<?php

namespace Modules\Venue\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Modules\Venue\Http\Requests\VenueUpdateRequest;

class VenueUpdateController extends Controller
{
    public function __invoke(VenueUpdateRequest $request, Venue $venue): JsonResponse
    {
        $validated = $request->validated();
        $validated['status'] = Venue::statusValue((string) $validated['status']);

        $venue->update($validated);

        Log::info('Venue updated', [
            'venue_id' => $venue->id,
            'user_id' => $request->user()?->id,
            'changes' => $validated,
        ]);

        return response()->json([
            'data' => $this->formatVenue($venue->fresh()),
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
