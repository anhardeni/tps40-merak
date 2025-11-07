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
        Schema::create('tangki', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id');

            // Detail Tangki Fields
            $table->string('no_tangki', 20);
            $table->string('jenis_isi', 50);
            $table->string('jenis_kemasan', 30)->nullable();
            $table->decimal('kapasitas', 15, 3)->default(0); // dalam liter atau m3
            $table->decimal('jumlah_isi', 15, 3)->default(0);
            $table->string('satuan', 10)->default('LITER'); // LITER, M3, KG, dll

            // Spesifikasi Tangki
            $table->decimal('panjang', 8, 2)->nullable(); // dalam meter
            $table->decimal('lebar', 8, 2)->nullable(); // dalam meter
            $table->decimal('tinggi', 8, 2)->nullable(); // dalam meter
            $table->decimal('berat_kosong', 10, 2)->nullable(); // dalam kg
            $table->decimal('berat_isi', 10, 2)->nullable(); // dalam kg

            // Kondisi dan Status
            $table->string('kondisi', 20)->default('BAIK'); // BAIK, RUSAK, BOCOR
            $table->text('keterangan')->nullable();
            $table->date('tgl_produksi')->nullable();
            $table->date('tgl_expired')->nullable();

            // Segel dan Security
            $table->string('no_segel_bc', 50)->nullable();
            $table->string('no_segel_perusahaan', 50)->nullable();

            // Positioning
            $table->string('lokasi_penempatan', 100)->nullable();
            $table->integer('urutan')->default(1);

            $table->timestamps();

            // Foreign Key
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');

            // Indexes
            $table->index(['document_id', 'urutan']);
            $table->index('no_tangki');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tangki');
    }
};
