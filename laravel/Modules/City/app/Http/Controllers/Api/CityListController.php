<?php

namespace Modules\City\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityListController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $cities = City::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static function (City $city) {
                return [
                    'id' => (int) $city->id,
                    'name' => $city->name,
                ];
            })
            ->values()
            ->all();

        return response()->json(['data' => $cities]);
    }
}
