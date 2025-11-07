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
        Schema::create('soap_logs', function (Blueprint $table) {
            $table->id();
            $table->string('method', 50); // CekDataSPPB, CekDataSPPB_TPB
            $table->string('endpoint', 255);

            // Request Details
            $table->json('request_data');
            $table->text('request_xml')->nullable();
            $table->timestamp('request_time');

            // Response Details
            $table->json('response_data')->nullable();
            $table->text('response_xml')->nullable();
            $table->timestamp('response_time')->nullable();
            $table->integer('response_code')->nullable();
            $table->string('response_status', 20)->nullable(); // SUCCESS, ERROR, TIMEOUT

            // Error Handling
            $table->text('error_message')->nullable();
            $table->text('error_trace')->nullable();

            // Request Context
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('document_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();

            // Performance Metrics
            $table->integer('duration_ms')->nullable(); // response time in milliseconds
            $table->bigInteger('request_size')->nullable(); // in bytes
            $table->bigInteger('response_size')->nullable(); // in bytes

            $table->timestamps();

            // Foreign Keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('set null');

            // Indexes
            $table->index(['method', 'response_status']);
            $table->index(['user_id', 'created_at']);
            $table->index(['document_id', 'method']);
            $table->index('request_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soap_logs');
    }
};
