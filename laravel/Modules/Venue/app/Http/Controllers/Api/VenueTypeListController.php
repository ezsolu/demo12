<?php

namespace Modules\Venue\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VenueType;
use Illuminate\Http\JsonResponse;

class VenueTypeListController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $venueTypes = VenueType::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static function (VenueType $venueType) {
                return [
                    'id' => (int) $venueType->id,
                    'name' => $venueType->name,
                ];
            })
            ->values()
            ->all();

        return response()->json(['data' => $venueTypes]);
    }
}
