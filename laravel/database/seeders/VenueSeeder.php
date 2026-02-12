<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Venue;
use App\Models\VenueType;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Venue::truncate();

        $cityIds = City::query()->pluck('id')->all();
        $venueTypeIds = VenueType::query()->pluck('id')->all();

        if (empty($cityIds) || empty($venueTypeIds)) {
            return;
        }

        $faker = Faker::create();
        $now = now();
        $rows = [];

        for ($i = 1; $i <= 120; $i++) {
            $lat = $faker->latitude(-44.0, -10.0);
            $lng = $faker->longitude(113.0, 153.0);

            $rows[] = [
                'name' => $faker->company(),
                'address' => $faker->address(),
                'latitude' => $lat,
                'longitude' => $lng,
                'seat_count' => $faker->numberBetween(50, 500),
                'people_count' => $faker->numberBetween(0, 500),
                'rating' => $faker->randomFloat(1, 3, 5),
                'rating_count' => $faker->numberBetween(0, 500),
                'price_level' => $faker->numberBetween(0, 5),
                'city_id' => $faker->randomElement($cityIds),
                'venue_type_id' => $faker->randomElement($venueTypeIds),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('venues')->insert($rows);
    }
}
