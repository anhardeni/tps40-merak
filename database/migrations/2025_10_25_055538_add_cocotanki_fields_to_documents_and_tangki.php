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
        // Add fields to documents table for HEADER section
        Schema::table('documents', function (Blueprint $table) {
            // Check if column exists before adding
            if (! Schema::hasColumn('documents', 'no_voy_flight')) {
                $table->string('no_voy_flight', 50)->nullable()->after('no_pol');
            }
            if (! Schema::hasColumn('documents', 'tgl_tiba')) {
                $table->date('tgl_tiba')->nullable()->after('tgl_entry');
            }
        });

        // Add fields to tangki table for DETIL section
        Schema::table('tangki', function (Blueprint $table) {
            if (! Schema::hasColumn('tangki', 'no_bl_awb')) {
                $table->string('no_bl_awb', 100)->nullable()->after('no_tangki');
            }
            if (! Schema::hasColumn('tangki', 'tgl_bl_awb')) {
                $table->date('tgl_bl_awb')->nullable()->after('no_bl_awb');
            }
            if (! Schema::hasColumn('tangki', 'id_consignee')) {
                $table->string('id_consignee', 20)->nullable()->after('tgl_bl_awb');
            }
            if (! Schema::hasColumn('tangki', 'consignee')) {
                $table->string('consignee', 200)->nullable()->after('id_consignee');
            }
            if (! Schema::hasColumn('tangki', 'no_bc11')) {
                $table->string('no_bc11', 20)->nullable()->after('consignee');
            }
            if (! Schema::hasColumn('tangki', 'tgl_bc11')) {
                $table->date('tgl_bc11')->nullable()->after('no_bc11');
            }
            if (! Schema::hasColumn('tangki', 'no_pos_bc11')) {
                $table->string('no_pos_bc11', 20)->nullable()->after('tgl_bc11');
            }
            if (! Schema::hasColumn('tangki', 'wk_inout')) {
                $table->string('wk_inout', 20)->nullable()->after('no_pos_bc11');
            }
            if (! Schema::hasColumn('tangki', 'pel_muat')) {
                $table->string('pel_muat', 10)->nullable()->after('wk_inout');
            }
            if (! Schema::hasColumn('tangki', 'pel_transit')) {
                $table->string('pel_transit', 10)->nullable()->after('pel_muat');
            }
            if (! Schema::hasColumn('tangki', 'pel_bongkar')) {
                $table->string('pel_bongkar', 10)->nullable()->after('pel_transit');
            }
        });

        // Tables kd_dok_inout and kd_sar_angkut_inout already exist from previous migration
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
