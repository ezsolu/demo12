<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\User;
use App\Models\Venue;
use App\Models\VenueType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VenueDetailApiTest extends TestCase
{
    use RefreshDatabase;

    private City $city;
    private VenueType $venueType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->city = City::query()->create(['name' => 'Sydney']);
        $this->venueType = VenueType::query()->create(['name' => 'Hotel']);
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

    public function test_show_returns_venue_detail(): void
    {
        $venue = $this->createVenue(['name' => 'Venue Detail']);

        $response = $this->getJson("/api/v1/venues/{$venue->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.id', $venue->id)
            ->assertJsonPath('data.name', 'Venue Detail')
            ->assertJsonPath('data.city_id', $this->city->id)
            ->assertJsonPath('data.venue_type_id', $this->venueType->id);
    }

    public function test_update_requires_admin_user(): void
    {
        $user = User::factory()->create();
        $venue = $this->createVenue();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/venues/{$venue->id}", [
            'name' => 'Updated Venue',
            'address' => '456 New Street',
            'latitude' => -33.86,
            'longitude' => 151.2,
            'seat_count' => 50,
            'people_count' => 40,
            'rating' => 4.2,
            'rating_count' => 12,
            'price_level' => 3,
            'city_id' => $this->city->id,
            'venue_type_id' => $this->venueType->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_venue_and_logs_change(): void
    {
        Log::spy();

        $admin = User::factory()->admin()->create();
        $venue = $this->createVenue();

        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/v1/venues/{$venue->id}", [
            'name' => 'Updated Venue',
            'address' => '456 New Street',
            'latitude' => -33.86,
            'longitude' => 151.2,
            'seat_count' => 50,
            'people_count' => 40,
            'rating' => 4.2,
            'rating_count' => 12,
            'price_level' => 3,
            'city_id' => $this->city->id,
            'venue_type_id' => $this->venueType->id,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Venue')
            ->assertJsonPath('data.price_level', 3);

        $this->assertDatabaseHas('venues', [
            'id' => $venue->id,
            'name' => 'Updated Venue',
            'address' => '456 New Street',
            'price_level' => 3,
        ]);

        Log::shouldHaveReceived('info')
            ->once()
            ->withArgs(function ($message, $context) use ($venue, $admin) {
                return $message === 'Venue updated'
                    && ($context['venue_id'] ?? null) === $venue->id
                    && ($context['user_id'] ?? null) === $admin->id;
            });
    }

    public function test_city_list_is_public(): void
    {
        City::query()->create(['name' => 'Melbourne']);

        $response = $this->getJson('/api/v1/cities');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name'],
                ],
            ]);
    }

    public function test_venue_type_list_is_public(): void
    {
        VenueType::query()->create(['name' => 'Bar']);

        $response = $this->getJson('/api/v1/venue-types');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name'],
                ],
            ]);
    }
}
