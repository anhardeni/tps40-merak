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
        Schema::create('tangki_references', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');
            $table->unsignedBigInteger('tangki_id');

            // Referensi ke dokumen lain atau SPPB
            $table->string('ref_type', 20); // SPPB, BC23, BC25, dll
            $table->string('ref_number', 50);
            $table->date('ref_date');
            $table->string('ref_pos', 10)->nullable(); // posisi dalam dokumen referensi

            // Detail referensi
            $table->string('jenis_dokumen_pabean', 10)->nullable();
            $table->string('no_dokumen_pabean', 50)->nullable();
            $table->date('tgl_dokumen_pabean')->nullable();

            // Kode-kode referensi
            $table->string('kd_dok_inout', 10)->nullable();
            $table->string('kd_sar_angkut_inout', 10)->nullable();

            // Quantity dan value
            $table->decimal('jumlah_referensi', 15, 3)->default(0);
            $table->string('satuan_referensi', 10)->nullable();
            $table->decimal('nilai_referensi', 15, 2)->default(0);

            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');
            $table->foreign('tangki_id')->references('id')->on('tangki')->onDelete('cascade');
            $table->foreign('kd_dok_inout')->references('kd_dok_inout')->on('kd_dok_inout');
            $table->foreign('kd_sar_angkut_inout')->references('kd_sar_angkut_inout')->on('kd_sar_angkut_inout');

            // Indexes
            $table->index(['document_id', 'ref_type']);
            $table->index(['ref_number', 'ref_date']);
            $table->unique(['tangki_id', 'ref_type', 'ref_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tangki_references');
    }
};
