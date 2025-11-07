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
            // Add audit fields
            $table->string('created_by')->nullable()->after('urutan');
            $table->string('updated_by')->nullable()->after('created_by');

            // Add foreign key for kd_dok_inout
            $table->foreign('kd_dok_inout')
                ->references('kd_dok_inout')
                ->on('kd_dok_inout')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            // Add unique constraint for no_tangki + seri_out
            $table->unique(['no_tangki', 'seri_out'], 'unique_tangki_seri');

            // Add indexes for better performance
            $table->index('kd_dok_inout');
            $table->index('seri_out');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tangki', function (Blueprint $table) {
            // Drop indexes and constraints in reverse order
            $table->dropIndex(['seri_out']);
            $table->dropIndex(['kd_dok_inout']);
            $table->dropUnique('unique_tangki_seri');
            $table->dropForeign(['kd_dok_inout']);

            // Drop audit fields
            $table->dropColumn(['created_by', 'updated_by']);
        });
    }
};
