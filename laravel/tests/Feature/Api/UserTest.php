<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('authenticated user can fetch api user', function () {
    $user = User::factory()->admin()->create();

    Sanctum::actingAs($user);

    $this->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('id', $user->id)
        ->assertJsonPath('role', $user->role);
});

test('guest cannot fetch api user', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});
