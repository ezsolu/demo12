<?php

namespace Modules\Venue\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class VenueUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->role === User::ROLE_ADMIN;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'seat_count' => ['required', 'integer', 'min:0'],
            'people_count' => ['required', 'integer', 'min:0'],
            'rating' => ['required', 'numeric', 'min:0', 'max:5'],
            'rating_count' => ['required', 'integer', 'min:0'],
            'price_level' => ['required', 'integer', 'min:1', 'max:5'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'venue_type_id' => ['required', 'integer', 'exists:venue_types,id'],
        ];
    }
}
