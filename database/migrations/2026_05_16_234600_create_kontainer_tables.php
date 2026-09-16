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
        Schema::create('kontainer_documents', function (Blueprint $table) {
            $table->id();
            $table->string('ref_number', 25)->unique();
            $table->string('kd_dok', 10); // Mapping to kodeDokumen in schema
            $table->string('kd_tps', 10);
            $table->string('kd_gudang', 10);
            $table->date('tgl_tiba');
            $table->string('no_bc11', 10)->nullable();
            $table->date('tgl_bc11')->nullable();
            
            // Operational fields
            $table->string('status')->default('DRAFT');
            $table->text('keterangan')->nullable();
            
            // Integration tracking
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->json('response_data')->nullable();
            
            // Audit trailing
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Foreign keys if necessary
            $table->foreign('kd_dok')->references('kd_dok')->on('kd_dok');
            $table->foreign('kd_tps')->references('kd_tps')->on('kd_tps');
            $table->foreign('kd_gudang')->references('kd_gudang')->on('kd_gudang');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');
        });

        Schema::create('kontainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kontainer_document_id')->constrained('kontainer_documents')->onDelete('cascade');
            
            // Schema Mapping - Detail Kontainer
            $table->string('no_kontainer', 20); // nomorKontainer
            $table->string('ukuran_kontainer', 10); // ukuranKontainer
            $table->string('no_segel', 20); // nomorSegel
            $table->string('jns_kontainer', 5); // jenisKontainer (4, 7, 8)
            $table->string('kd_kantor', 10)->nullable(); // kodeKantor
            $table->string('no_bl_awb', 30)->nullable(); // noBlAwb
            $table->date('tgl_bl_awb')->nullable(); // tanggalBlAwb
            $table->string('no_master_bl_awb', 30)->nullable(); // noMasterBlAwb
            $table->date('tgl_master_bl_awb')->nullable(); // tanggalMasterBlAwb
            $table->string('id_consignee', 22)->nullable(); // idConsignee
            $table->string('consignee', 60)->nullable(); // consignee
            $table->decimal('bruto', 24, 4); // bruto
            $table->dateTime('wk_inout'); // waktuInOut
            $table->string('no_pos_bc11', 12)->nullable(); // nomorPosBc11
            $table->string('kd_timbun', 20)->nullable(); // kodeTimbun
            $table->string('kd_sar_angkut', 5)->nullable(); // kodeSaranaPengangkut
            $table->string('no_pol', 15)->nullable(); // nomorPolisi
            $table->boolean('fl_kontainer')->default(false); // flagKontainer
            $table->string('iso_code', 30)->nullable(); // isoCode
            $table->string('pel_muat', 5)->nullable(); // pelabuhanMuat
            $table->string('pel_transit', 5)->nullable(); // pelabuhanTransit
            $table->string('pel_bongkar', 5)->nullable(); // pelabuhanBongkar
            $table->string('gudang_tujuan', 5)->nullable(); // gudangTujuan
            $table->string('no_daftar_pabean', 10)->nullable(); // nomorDaftarPabean
            $table->date('tgl_daftar_pabean')->nullable(); // tanggalDaftarPabean
            $table->string('no_segel_bc', 30)->nullable(); // nomorSegelBc
            $table->date('tgl_segel_bc')->nullable(); // tanggalSegelBc
            $table->string('no_ijin_tps', 40)->nullable(); // nomorIjinTps
            $table->date('tgl_ijin_tps')->nullable(); // tanggalIjinTps
            $table->string('kd_dok_inout', 10)->nullable(); // kodeDokumenInOut
            
            $table->integer('urutan')->default(1);
            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index('no_kontainer');
            $table->index('kontainer_document_id');
        });

        Schema::create('kontainer_audits', function (Blueprint $table) {
            $table->id();
            $table->string('auditable_type');
            $table->unsignedBigInteger('auditable_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('event'); // created, updated, deleted, restored
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('url')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();

            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kontainer_audits');
        Schema::dropIfExists('kontainers');
        Schema::dropIfExists('kontainer_documents');
    }
};
