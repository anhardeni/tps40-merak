<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');

        // Seed in correct order (reference data → users → credentials → documents → tangki)
        $this->call([
            ReferenceDataSeeder::class,
            UserSeeder::class,
            BeacukaiCredentialSeeder::class,
            DocumentSeeder::class,
            TangkiSeeder::class,
        ]);

        $this->command->info('✅ Database seeding completed successfully!');
    }
}
