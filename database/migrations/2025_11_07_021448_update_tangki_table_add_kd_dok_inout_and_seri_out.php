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
            // Add kd_dok_inout foreign key (MANDATORY)
            $table->string('kd_dok_inout', 10)->after('document_id');
            $table->foreign('kd_dok_inout')
                  ->references('kd_dok_inout')
                  ->on('kd_dok_inout')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
            
            // Add seri_out (urutan kegiatan tangki)
            $table->integer('seri_out')->unsigned()->after('no_tangki');
            
            // Add audit fields
            $table->string('created_by')->nullable()->after('updated_at');
            $table->string('updated_by')->nullable()->after('created_by');
            
            // Add unique constraint: no_tangki + seri_out must be unique
            $table->unique(['no_tangki', 'seri_out'], 'unique_tangki_seri');
            
            // Add index for better query performance
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
            // Drop unique constraint first
            $table->dropUnique('unique_tangki_seri');
            
            // Drop indexes
            $table->dropIndex(['kd_dok_inout']);
            $table->dropIndex(['seri_out']);
            
            // Drop foreign key
            $table->dropForeign(['kd_dok_inout']);
            
            // Drop columns
            $table->dropColumn(['kd_dok_inout', 'seri_out', 'created_by', 'updated_by']);
        });
    }
};
