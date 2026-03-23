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
        Schema::table('tangki', function (Blueprint $table) {
            $table->string('no_dok_ijin_tps', 35)->nullable();
            $table->date('tgl_dok_ijin_tps')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tangki', function (Blueprint $table) {
            $table->dropColumn(['no_dok_ijin_tps', 'tgl_dok_ijin_tps']);
        });
    }
};
