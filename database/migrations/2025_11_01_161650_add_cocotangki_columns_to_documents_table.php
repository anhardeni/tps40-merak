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
        Schema::table('documents', function (Blueprint $table) {
            $table->string('cocotangki_status', 20)->nullable()->after('status')->comment('Status pengiriman CoCoTangki: sent, error');
            $table->timestamp('cocotangki_sent_at')->nullable()->after('cocotangki_status')->comment('Tanggal pengiriman CoCoTangki');
            $table->text('cocotangki_error')->nullable()->after('cocotangki_sent_at')->comment('Error message jika gagal kirim');
            $table->text('cocotangki_response')->nullable()->after('cocotangki_error')->comment('Response dari CoCoTangki API');
            
            $table->index('cocotangki_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['cocotangki_status']);
            $table->dropColumn([
                'cocotangki_status',
                'cocotangki_sent_at',
                'cocotangki_error',
                'cocotangki_response',
            ]);
        });
    }
};
