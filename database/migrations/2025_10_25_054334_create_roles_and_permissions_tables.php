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
        // Roles Table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Permissions Table
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('display_name', 150);
            $table->text('description')->nullable();
            $table->string('module', 50)->nullable(); // documents, users, reports, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Role-Permission Pivot Table
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permission_id');
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');

            $table->unique(['role_id', 'permission_id']);
        });

        // User-Role Pivot Table
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->timestamp('assigned_at')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('set null');

            $table->unique(['user_id', 'role_id']);
        });

        // Update users table to add additional fields
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->nullable()->after('email');
            $table->string('employee_id', 20)->unique()->nullable()->after('username');
            $table->string('phone', 20)->nullable()->after('employee_id');
            $table->string('department', 50)->nullable()->after('phone');
            $table->string('position', 50)->nullable()->after('department');
            $table->boolean('is_active')->default(true)->after('position');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'employee_id', 'phone', 'department',
                'position', 'is_active', 'last_login_at', 'last_login_ip',
            ]);
        });

        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
