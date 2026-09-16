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
            if (!Schema::hasColumn('documents', 'no_voy_flight')) {
                $table->string('no_voy_flight', 50)->nullable();
            }
            if (!Schema::hasColumn('documents', 'tgl_tiba')) {
                $table->date('tgl_tiba')->nullable();
            }
            if (!Schema::hasColumn('documents', 'call_sign')) {
                $table->string('call_sign', 50)->nullable();
            }
            if (!Schema::hasColumn('documents', 'no_dok_ijin_tps')) {
                $table->string('no_dok_ijin_tps', 50)->nullable();
            }
            if (!Schema::hasColumn('documents', 'tgl_dok_ijin_tps')) {
                $table->date('tgl_dok_ijin_tps')->nullable();
            }
            if (!Schema::hasColumn('documents', 'cocotangki_status')) {
                $table->string('cocotangki_status', 20)->nullable();
            }
            if (!Schema::hasColumn('documents', 'cocotangki_sent_at')) {
                $table->timestamp('cocotangki_sent_at')->nullable();
            }
            if (!Schema::hasColumn('documents', 'cocotangki_error')) {
                $table->text('cocotangki_error')->nullable();
            }
            if (!Schema::hasColumn('documents', 'cocotangki_response')) {
                $table->text('cocotangki_response')->nullable();
            }
        });

        Schema::table('tangki', function (Blueprint $table) {
            if (!Schema::hasColumn('tangki', 'no_bl_awb')) {
                $table->string('no_bl_awb', 50)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'tgl_bl_awb')) {
                $table->date('tgl_bl_awb')->nullable();
            }
            if (!Schema::hasColumn('tangki', 'id_consignee')) {
                $table->string('id_consignee', 50)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'consignee')) {
                $table->string('consignee', 200)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'no_bc11')) {
                $table->string('no_bc11', 50)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'tgl_bc11')) {
                $table->date('tgl_bc11')->nullable();
            }
            if (!Schema::hasColumn('tangki', 'no_pos_bc11')) {
                $table->string('no_pos_bc11', 12)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'jml_satuan')) {
                $table->decimal('jml_satuan', 18, 4)->default(0);
            }
            if (!Schema::hasColumn('tangki', 'jns_satuan')) {
                $table->string('jns_satuan', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'kd_dok_inout')) {
                $table->string('kd_dok_inout', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'no_dok_inout')) {
                $table->string('no_dok_inout', 50)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'tgl_dok_inout')) {
                $table->date('tgl_dok_inout')->nullable();
            }
            if (!Schema::hasColumn('tangki', 'wk_inout')) {
                $table->string('wk_inout', 50)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'kd_sar_angkut_inout')) {
                $table->string('kd_sar_angkut_inout', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'no_pol')) {
                $table->string('no_pol', 20)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'seri_out')) {
                $table->string('seri_out', 20)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'pel_muat')) {
                $table->string('pel_muat', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'pel_transit')) {
                $table->string('pel_transit', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'pel_bongkar')) {
                $table->string('pel_bongkar', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'jenis_isi')) {
                $table->string('jenis_isi', 50)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'jumlah_isi')) {
                $table->decimal('jumlah_isi', 18, 4)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'satuan')) {
                $table->string('satuan', 10)->nullable();
            }
            if (!Schema::hasColumn('tangki', 'urutan')) {
                $table->integer('urutan')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down needed as columns are guarded
    }
};
