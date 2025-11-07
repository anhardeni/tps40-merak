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
        Schema::create('beacukai_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('service_name', 50)->unique(); // cocotangki, sppb, dll
            $table->string('service_type', 30)->default('SOAP'); // SOAP, REST, etc
            $table->string('username')->nullable();
            $table->text('password')->nullable(); // encrypted
            $table->string('endpoint_url')->nullable();
            $table->json('additional_config')->nullable(); // untuk config tambahan
            $table->boolean('is_active')->default(true);
            $table->boolean('is_test_mode')->default(false);
            $table->text('description')->nullable();
            $table->integer('usage_count')->default(0);

            // Audit fields
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('created_by')->references('id')->on('users');
            $table->foreign('updated_by')->references('id')->on('users');

            // Indexes
            $table->index(['service_name', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beacukai_credentials');
    }
};
