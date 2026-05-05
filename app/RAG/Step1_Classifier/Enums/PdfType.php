<?php
namespace App\RAG\Step1_Classifier\Enums;
enum PdfType: string {
    case TEXT = 'text'; case IMAGE = 'image'; case HYBRID = 'hybrid';
    public function requiresOcr(): bool { return match ($this) { self::TEXT => false, default => true }; }
    public function label(): string { return match ($this) { self::TEXT => 'PDF Teks', self::IMAGE => 'PDF Scan', self::HYBRID => 'PDF Campuran' }; }
}
