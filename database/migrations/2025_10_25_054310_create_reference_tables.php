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
        // Tabel kd_dok (Kode Dokumen)
        Schema::create('kd_dok', function (Blueprint $table) {
            $table->string('kd_dok', 10)->primary();
            $table->string('nm_dok', 100);
            $table->string('keterangan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel kd_tps (Kode TPS)
        Schema::create('kd_tps', function (Blueprint $table) {
            $table->string('kd_tps', 10)->primary();
            $table->string('nm_tps', 100);
            $table->string('alamat')->nullable();
            $table->string('kota', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel nm_angkut (Nama Angkutan)
        Schema::create('nm_angkut', function (Blueprint $table) {
            $table->id();
            $table->string('nm_angkut', 100);
            $table->string('call_sign', 50)->nullable();
            $table->string('jenis_angkutan', 20)->nullable(); // kapal, pesawat, dll
            $table->string('bendera', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel kd_gudang (Kode Gudang)
        Schema::create('kd_gudang', function (Blueprint $table) {
            $table->string('kd_gudang', 10)->primary();
            $table->string('nm_gudang', 100);
            $table->string('kd_tps', 10);
            $table->string('alamat')->nullable();
            $table->decimal('kapasitas', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('kd_tps')->references('kd_tps')->on('kd_tps');
        });

        // Tabel kd_dok_inout (Kode Dokumen In/Out)
        Schema::create('kd_dok_inout', function (Blueprint $table) {
            $table->string('kd_dok_inout', 10)->primary();
            $table->string('nm_dok_inout', 100);
            $table->string('jenis', 10); // IN atau OUT
            $table->string('keterangan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel kd_sar_angkut_inout (Kode Sarana Angkut In/Out)
        Schema::create('kd_sar_angkut_inout', function (Blueprint $table) {
            $table->string('kd_sar_angkut_inout', 10)->primary();
            $table->string('nm_sar_angkut_inout', 100);
            $table->string('jenis', 10); // IN atau OUT
            $table->string('keterangan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kd_sar_angkut_inout');
        Schema::dropIfExists('kd_dok_inout');
        Schema::dropIfExists('kd_gudang');
        Schema::dropIfExists('nm_angkut');
        Schema::dropIfExists('kd_tps');
        Schema::dropIfExists('kd_dok');
    }
};
