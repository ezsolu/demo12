<?php

namespace Modules\Venue\Services;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class VenueListService
{
    public function list(array $params): array
    {
        $baseQuery = Venue::query()
            ->leftJoin('venue_types', 'venues.venue_type_id', '=', 'venue_types.id')
            ->leftJoin('cities', 'venues.city_id', '=', 'cities.id');

        $this->applyFilters($baseQuery, $params);

        $recordsTotal = Venue::count();
        $recordsFiltered = (clone $baseQuery)->distinct('venues.id')->count('venues.id');

        [$orderColumn, $orderDirection] = $this->resolveOrder($params);

        $start = max((int) ($params['start'] ?? 0), 0);
        $length = (int) ($params['length'] ?? 50);
        if ($length <= 0 || $length > 200) {
            $length = 50;
        }

        $data = (clone $baseQuery)
            ->select([
                'venues.id',
                'venues.status',
                'venues.name',
                'venues.address',
                'venues.latitude',
                'venues.longitude',
                'venues.seat_count',
                'venues.people_count',
                'venues.price_level',
                'venues.city_id',
                'venues.venue_type_id',
                DB::raw('venue_types.name as venue_type_name'),
                DB::raw('cities.name as city_name'),
            ])
            ->orderBy($orderColumn, $orderDirection)
            ->skip($start)
            ->take($length)
            ->get()
            ->map(static function ($row) {
                return [
                    'id' => (int) $row->id,
                    'status' => Venue::statusLabel((int) $row->status),
                    'name' => $row->name,
                    'address' => $row->address,
                    'latitude' => $row->latitude !== null ? (float) $row->latitude : null,
                    'longitude' => $row->longitude !== null ? (float) $row->longitude : null,
                    'seat_count' => (int) $row->seat_count,
                    'people_count' => (int) $row->people_count,
                    'price_level' => (int) $row->price_level,
                    'city_id' => (int) $row->city_id,
                    'city_name' => $row->city_name,
                    'venue_type_id' => (int) $row->venue_type_id,
                    'venue_type_name' => $row->venue_type_name,
                ];
            })
            ->values()
            ->all();

        return [
            'draw' => (int) ($params['draw'] ?? 0),
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $data,
        ];
    }

    private function applyFilters(Builder $query, array $params): void
    {
        $searchValue = data_get($params, 'search.value');
        $name = $params['name'] ?? null;
        $venueTypeId = $params['venue_type_id'] ?? null;
        $venueType = $params['venue_type'] ?? null;
        $cityId = $params['city_id'] ?? null;
        $city = $params['city'] ?? null;
        $priceLevel = $params['price_level'] ?? null;
        $status = $params['status'] ?? 'show';

        if ($searchValue) {
            $query->where('venues.name', 'like', '%' . $searchValue . '%');
        }

        if ($name) {
            $query->where('venues.name', 'like', '%' . $name . '%');
        }

        if ($venueTypeId) {
            $query->where('venues.venue_type_id', $venueTypeId);
        }

        if ($venueType) {
            $query->where('venue_types.name', 'like', '%' . $venueType . '%');
        }

        if ($cityId) {
            $query->where('venues.city_id', $cityId);
        }

        if ($city) {
            $query->where('cities.name', 'like', '%' . $city . '%');
        }

        if ($priceLevel !== null && $priceLevel !== '') {
            $query->where('venues.price_level', (int) $priceLevel);
        }

        if ($status !== 'all') {
            $query->where('venues.status', Venue::statusValue((string) $status));
        }
    }

    private function resolveOrder(array $params): array
    {
        $columnIndex = data_get($params, 'order.0.column');
        $direction = strtolower((string) data_get($params, 'order.0.dir', 'desc'));

        if (!in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $columnKey = $columnIndex !== null
            ? data_get($params, "columns.{$columnIndex}.data")
            : null;

        $orderMap = [
            'id' => 'venues.id',
            'name' => 'venues.name',
            'address' => 'venues.address',
            'seat_count' => 'venues.seat_count',
            'people_count' => 'venues.people_count',
            'price_level' => 'venues.price_level',
            'venue_type_name' => 'venue_types.name',
            'city_name' => 'cities.name',
        ];

        if ($columnKey && isset($orderMap[$columnKey])) {
            return [$orderMap[$columnKey], $direction];
        }

        return ['venues.id', 'desc'];
    }
}
