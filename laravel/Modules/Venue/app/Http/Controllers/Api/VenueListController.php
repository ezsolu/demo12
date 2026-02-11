<?php

namespace Modules\Venue\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Venue\Http\Requests\VenueListRequest;
use Modules\Venue\Services\VenueListService;

class VenueListController extends Controller
{
    public function __construct(private readonly VenueListService $venueListService) {}

    public function __invoke(VenueListRequest $request): JsonResponse
    {
        $request->validated();
        $payload = $this->venueListService->list($request->all());

        return response()->json([
            'draw' => (int) ($payload['draw'] ?? 0),
            'recordsTotal' => $payload['recordsTotal'],
            'recordsFiltered' => $payload['recordsFiltered'],
            'data' => $payload['data'],
        ]);
    }
}
