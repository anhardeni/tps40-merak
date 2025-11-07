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
            $table->string('kd_sar_angkut_inout', 10)->nullable()->after('tgl_dok_inout');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tangki', function (Blueprint $table) {
            $table->dropColumn('kd_sar_angkut_inout');
        });
    }
};
