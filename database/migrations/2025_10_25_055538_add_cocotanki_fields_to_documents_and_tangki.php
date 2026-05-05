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
        Schema::table('documents', function (Blueprint $table) {
            $table->string('no_voy_flight', 50)->nullable()->after('kd_gudang');
            $table->date('tgl_tiba')->nullable()->after('no_voy_flight');
            $table->string('call_sign', 50)->nullable()->after('tgl_tiba');
        });

        Schema::table('tangki', function (Blueprint $table) {
            $table->string('no_bl_awb', 50)->nullable()->after('no_tangki');
            $table->date('tgl_bl_awb')->nullable()->after('no_bl_awb');
            $table->string('id_consignee', 50)->nullable()->after('tgl_bl_awb');
            $table->string('consignee', 200)->nullable()->after('id_consignee');
            $table->string('no_bc11', 50)->nullable()->after('consignee');
            $table->date('tgl_bc11')->nullable()->after('no_bc11');
            $table->string('no_pos_bc11', 12)->nullable()->after('tgl_bc11');
            $table->string('wk_inout', 50)->nullable()->after('no_pos_bc11');
            $table->string('pel_muat', 10)->nullable()->after('wk_inout');
            $table->string('pel_transit', 10)->nullable()->after('pel_muat');
            $table->string('pel_bongkar', 10)->nullable()->after('pel_transit');
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
