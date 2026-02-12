<?php

namespace Modules\Venue\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VenueListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'draw' => ['nullable', 'integer'],
            'start' => ['nullable', 'integer', 'min:0'],
            'length' => ['nullable', 'integer', 'min:1', 'max:200'],
            'search' => ['nullable', 'array'],
            'search.value' => ['nullable', 'string', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'venue_type_id' => ['nullable', 'integer', 'exists:venue_types,id'],
            'venue_type' => ['nullable', 'string', 'max:255'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'city' => ['nullable', 'string', 'max:255'],
            'price_level' => ['nullable', 'integer', 'min:0', 'max:5'],
            'status' => ['nullable', 'string', 'in:show,hide,all'],
        ];
    }
}
