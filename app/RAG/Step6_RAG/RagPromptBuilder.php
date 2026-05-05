<?php
namespace App\RAG\Step6_RAG;
class RagPromptBuilder {
    public function build(string $query, string $context): string {
        return "Berdasarkan referensi berikut:\n=== REFERENSI ===\n{$context}\n=== AKHIR ===\n\nTentukan HS Code untuk: \"{$query}\"\nFormat:\n**HS Code**: [kode]\n**Uraian**: [deskripsi]\n**Alasan**: [alasan]";
    }
}
