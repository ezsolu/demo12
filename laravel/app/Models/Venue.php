<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venue extends Model
{
    const STATUS_ACTIVE = 1;
    const STATUS_INACTIVE = 0;
    const STATUS_SHOW = self::STATUS_ACTIVE;
    const STATUS_HIDE = self::STATUS_INACTIVE;

    protected $fillable = [
        'status',
        'name',
        'address',
        'latitude',
        'longitude',
        'seat_count',
        'people_count',
        'rating',
        'rating_count',
        'price_level',
        'rental_price',
        'rental_status',
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

    public static function statusLabel(?int $status): string
    {
        return $status === self::STATUS_HIDE ? 'hide' : 'show';
    }

    public static function statusValue(string $label): ?int
    {
        return match ($label) {
            'show' => self::STATUS_SHOW,
            'hide' => self::STATUS_HIDE,
            default => null,
        };
    }
}
