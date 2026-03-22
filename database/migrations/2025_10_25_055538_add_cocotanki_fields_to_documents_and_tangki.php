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
        Schema::table('documents_and_tangki', function (Blueprint $table) {
            //
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop tables as they exist from previous migration

        Schema::table('tangki', function (Blueprint $table) {
            $table->dropColumn([
                'no_bl_awb', 'tgl_bl_awb', 'id_consignee', 'consignee',
                'no_bc11', 'tgl_bc11', 'no_pos_bc11', 'wk_inout',
                'pel_muat', 'pel_transit', 'pel_bongkar',
            ]);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['no_voy_flight', 'tgl_tiba']);
        });
    }
};
