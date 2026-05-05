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
        Schema::create('user_location_access', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('kd_tps');
            $table->string('kd_gudang');
            $table->timestamps();

            // Index for faster lookups
            $table->index(['user_id', 'kd_tps', 'kd_gudang']);
            
            // Unique constraint to prevent duplicate mappings
            $table->unique(['user_id', 'kd_tps', 'kd_gudang']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_location_access');
    }
};
