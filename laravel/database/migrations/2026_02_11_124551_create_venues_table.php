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
            $table->string('name');
            $table->string('address');
            $table->geography('coordinates', subtype: 'POINT', srid: 4326);
            $table->unsignedMediumInteger('seat_count')->default(0);
            $table->unsignedMediumInteger('people_count')->default(0);
            $table->decimal('rating', 3, 1)->default(5);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedTinyInteger('price_level')->default(2);
            $table->mediumInteger('city_id')->index();
            $table->tinyInteger('venue_type_id')->index();
            $table->timestamps();
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
