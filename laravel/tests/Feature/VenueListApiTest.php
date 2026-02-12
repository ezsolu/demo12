<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Venue;
use App\Models\VenueType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VenueListApiTest extends TestCase
{
    use RefreshDatabase;

    private City $city;
    private City $cityOther;
    private VenueType $venueType;
    private VenueType $venueTypeOther;

    protected function setUp(): void
    {
        parent::setUp();

        $this->city = City::query()->create(['name' => 'Sydney']);
        $this->cityOther = City::query()->create(['name' => 'Melbourne']);
        $this->venueType = VenueType::query()->create(['name' => 'Hotel']);
        $this->venueTypeOther = VenueType::query()->create(['name' => 'Bar']);
    }

    private function createVenue(array $overrides = []): Venue
    {
        return Venue::query()->create(array_merge([
            'name' => 'Venue A',
            'address' => '123 Main Street',
            'latitude' => -33.865143,
            'longitude' => 151.2099,
            'seat_count' => 120,
            'people_count' => 80,
            'rating' => 4.5,
            'rating_count' => 10,
            'price_level' => 2,
            'city_id' => $this->city->id,
            'venue_type_id' => $this->venueType->id,
        ], $overrides));
    }

    public function test_list_returns_datatables_payload(): void
    {
        $this->createVenue(['name' => 'Venue A']);
        $this->createVenue(['name' => 'Venue B', 'city_id' => $this->cityOther->id]);
        $this->createVenue(['name' => 'Venue C', 'venue_type_id' => $this->venueTypeOther->id]);

        $response = $this->getJson('/api/v1/venues?draw=3&start=0&length=50');

        $response
            ->assertOk()
            ->assertJsonPath('draw', 3)
            ->assertJsonPath('recordsTotal', 3)
            ->assertJsonPath('recordsFiltered', 3)
            ->assertJsonStructure([
                'draw',
                'recordsTotal',
                'recordsFiltered',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'address',
                        'latitude',
                        'longitude',
                        'seat_count',
                        'people_count',
                        'price_level',
                        'city_id',
                        'city_name',
                        'venue_type_id',
                        'venue_type_name',
                    ],
                ],
            ]);
    }

    public function test_filters_by_name_and_price_level(): void
    {
        $this->createVenue([
            'name' => 'Sydney Conference',
            'price_level' => 3,
        ]);
        $this->createVenue([
            'name' => 'Melbourne Lounge',
            'price_level' => 1,
        ]);

        $response = $this->getJson('/api/v1/venues?name=Sydney&price_level=3');

        $response
            ->assertOk()
            ->assertJsonPath('recordsTotal', 2)
            ->assertJsonPath('recordsFiltered', 1);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertSame('Sydney Conference', $data[0]['name']);
    }

    public function test_filters_by_city_and_type(): void
    {
        $this->createVenue([
            'name' => 'City Hotel',
            'city_id' => $this->city->id,
            'venue_type_id' => $this->venueType->id,
        ]);
        $this->createVenue([
            'name' => 'Other Venue',
            'city_id' => $this->cityOther->id,
            'venue_type_id' => $this->venueTypeOther->id,
        ]);

        $response = $this->getJson('/api/v1/venues?city=Sydney&venue_type=Hotel');

        $response
            ->assertOk()
            ->assertJsonPath('recordsTotal', 2)
            ->assertJsonPath('recordsFiltered', 1);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertSame('City Hotel', $data[0]['name']);
    }

    public function test_invalid_filters_return_422(): void
    {
        $response = $this->getJson('/api/v1/venues?price_level=9');

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors(['price_level']);
    }
}
