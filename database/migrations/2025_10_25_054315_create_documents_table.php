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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('ref_number', 20)->unique(); // Format: AAAAYYMMDDNNNNNN
            $table->string('kd_dok', 10);
            $table->string('kd_tps', 10);
            $table->unsignedBigInteger('nm_angkut_id');
            $table->string('kd_gudang', 10);

            // Header Document Fields
            $table->string('no_pol', 20)->nullable();
            $table->date('tgl_entry');
            $table->string('jam_entry', 8);
            $table->date('tgl_gate_in')->nullable();
            $table->string('jam_gate_in', 8)->nullable();
            $table->date('tgl_gate_out')->nullable();
            $table->string('jam_gate_out', 8)->nullable();

            // Status
            $table->string('status', 20)->default('DRAFT'); // DRAFT, SUBMITTED, APPROVED, REJECTED
            $table->text('keterangan')->nullable();

            // SOAP Integration
            $table->string('sppb_number', 50)->nullable();
            $table->json('sppb_data')->nullable();
            $table->timestamp('sppb_checked_at')->nullable();

            // Host-to-Host
            $table->boolean('sent_to_host')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->json('host_response')->nullable();

            // Audit Trail
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('kd_dok')->references('kd_dok')->on('kd_dok');
            $table->foreign('kd_tps')->references('kd_tps')->on('kd_tps');
            $table->foreign('nm_angkut_id')->references('id')->on('nm_angkut');
            $table->foreign('kd_gudang')->references('kd_gudang')->on('kd_gudang');
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');

            // Indexes
            $table->index(['status', 'tgl_entry']);
            $table->index(['kd_tps', 'tgl_entry']);
            $table->index('sppb_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
