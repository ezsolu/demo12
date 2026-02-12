<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        City::truncate();

        City::insert([
            ['name' => 'Sydney CBD'],
            ['name' => 'Melbourne'],
            ['name' => 'Brisbane'],
            ['name' => 'Perth'],
            ['name' => 'Adelaide'],
            ['name' => 'Hobart'],
            ['name' => 'Darwin'],
        ]);
    }
}
