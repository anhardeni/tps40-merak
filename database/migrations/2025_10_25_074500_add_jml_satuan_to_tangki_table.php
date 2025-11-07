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
            $table->decimal('jml_satuan', 15, 3)->nullable()->after('no_pos_bc11')
                ->comment('Jumlah satuan untuk CoCoTangki');
            $table->string('jns_satuan', 10)->default('KGM')->after('jml_satuan')
                ->comment('Jenis satuan (KGM, LTR, dll)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tangki', function (Blueprint $table) {
            $table->dropColumn(['jml_satuan', 'jns_satuan']);
        });
    }
};
