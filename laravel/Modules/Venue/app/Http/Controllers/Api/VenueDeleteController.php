<?php

namespace Modules\Venue\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class VenueDeleteController extends Controller
{
    public function __invoke(Venue $venue): Response
    {
        $user = request()->user();
        abort_unless($user && $user->role === User::ROLE_ADMIN, 403);

        $venueId = $venue->id;
        $venue->delete();

        Log::info('Venue deleted', [
            'venue_id' => $venueId,
            'user_id' => $user->id,
        ]);

        return response()->noContent();
    }
}
