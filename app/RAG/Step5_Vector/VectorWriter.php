<?php
namespace App\RAG\Step5_Vector;
use App\RAG\Step5_Vector\Models\PdfVector;
use Illuminate\Support\Facades\DB;
class VectorWriter {
    public function store(string $section, string $content, array $embedding, array $meta = []): PdfVector {
        $vector = PdfVector::create([
            'section' => $section, 'content' => $content, 'embedding' => $embedding,
            'source' => $meta['source'] ?? 'Explanatory Notes'
        ]);
        try { DB::statement("UPDATE pdf_vectors SET embedding_vec = VEC_FromText(?) WHERE id = ?", [json_encode($embedding), $vector->id]); } catch (\Exception $e) {}
        return $vector;
    }
}
