<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('status')->default(1);
            $table->string('name');
            $table->string('address');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->unsignedMediumInteger('seat_count')->default(0);
            $table->unsignedMediumInteger('people_count')->default(0);
            $table->decimal('rating', 3, 1)->default(5);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedTinyInteger('price_level')->default(2);
            $table->mediumInteger('rental_price')->default(0);
            $table->unsignedTinyInteger('rental_status')->default(1);
            $table->mediumInteger('city_id')->index();
            $table->tinyInteger('venue_type_id')->index();
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};
