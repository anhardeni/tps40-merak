<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('pdf_vectors')) {
            Schema::create('pdf_vectors', function (Blueprint $table) {
                $table->id();
                $table->string('section');
                $table->longText('content');
                $table->json('embedding')->nullable();
                $table->string('source')->default('Explanatory Notes');
                $table->string('reference_url')->nullable();
                $table->string('ruling_id')->nullable();
                $table->string('hs_code', 20)->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasColumn('pdf_vectors', 'source')) {
            Schema::table('pdf_vectors', function (Blueprint $table) {
                $table->string('source')->default('Explanatory Notes');
                $table->string('reference_url')->nullable();
                $table->string('ruling_id')->nullable();
                $table->string('hs_code', 20)->nullable();
            });
        }

        try {
            DB::statement('ALTER TABLE pdf_vectors ADD COLUMN embedding_vec VECTOR(768) NOT NULL');
        } catch (\Throwable $e) {
            Log::info('embedding_vec mungkin sudah ada: ' . $e->getMessage());
        }

        try {
            DB::statement('ALTER TABLE pdf_vectors ADD VECTOR INDEX idx_pdf_vectors_embedding (embedding_vec)');
        } catch (\Throwable $e) {
            Log::info('vector index mungkin sudah ada / belum support: ' . $e->getMessage());
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_vectors');
    }
};
