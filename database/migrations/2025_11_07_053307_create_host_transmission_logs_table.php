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
        Schema::create('host_transmission_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('format', 10); // xml or json
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->text('request_data')->nullable(); // XML/JSON yang dikirim
            $table->text('response_data')->nullable(); // Response dari host
            $table->integer('response_time')->nullable(); // ms
            $table->integer('transmission_size')->nullable(); // bytes
            $table->string('transmitter', 50)->nullable(); // User atau system
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at');
            $table->foreignId('sent_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes
            $table->index(['document_id', 'sent_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('host_transmission_logs');
    }
};
