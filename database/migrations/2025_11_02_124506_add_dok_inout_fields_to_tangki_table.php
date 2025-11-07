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
            // Informasi Dokumen In/Out TPS
            $table->string('kd_dok_inout', 10)->nullable()->after('document_id');
            $table->string('no_dok_inout', 50)->nullable()->after('kd_dok_inout');
            $table->date('tgl_dok_inout')->nullable()->after('no_dok_inout');
            $table->integer('seri_out')->nullable()->after('tgl_dok_inout');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tangki', function (Blueprint $table) {
            $table->dropColumn([
                'kd_dok_inout',
                'no_dok_inout',
                'tgl_dok_inout',
                'seri_out',
            ]);
        });
    }
};
