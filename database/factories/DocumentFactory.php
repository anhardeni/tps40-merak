<?php

namespace Database\Factories;

use App\Models\Document;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ref_number' => 'DOC-' . $this->faker->unique()->numberBetween(1000, 9999),
            'kd_dok' => '1',
            'kd_tps' => 'TPSL',
            'nm_angkut_id' => 1,
            'kd_gudang' => 'G001',
            'no_voy_flight' => $this->faker->bothify('V##??'),
            'tgl_entry' => now(),
            'jam_entry' => '08:00',
            'status' => 'draft',
            'username' => 'testuser',
            'created_by' => 1,
        ];
    }
}
