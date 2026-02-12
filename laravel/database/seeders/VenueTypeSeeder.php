<?php

namespace Database\Seeders;

use App\Models\VenueType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VenueTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        VenueType::truncate();
        VenueType::insert([
            ['name' => 'Ballroom'],
            ['name' => 'Function Venue'],
            ['name' => 'Hotel'],
            ['name' => 'Zoo'],
            ['name' => 'Aquarium'],
            ['name' => 'Park'],
            ['name' => 'Stadium'],
            ['name' => 'Theatre'],
            ['name' => 'Bar'],
            ['name' => 'Other'],
        ]);
    }
}
