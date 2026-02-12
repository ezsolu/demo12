<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venue extends Model
{
    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
        'seat_count',
        'people_count',
        'rating',
        'rating_count',
        'price_level',
        'city_id',
        'venue_type_id',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function venueType()
    {
        return $this->belongsTo(VenueType::class);
    }
}
