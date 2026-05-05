<?php
namespace App\RAG\Step1_Classifier;
use App\RAG\Exceptions\PdfClassificationException;
use App\RAG\Step1_Classifier\Enums\PdfType;
use Illuminate\Support\Facades\Log;

class PdfClassifierService {
    private const TEXT_THRESHOLD = 100;
    private const HYBRID_LOWER = 0.20;
    private const HYBRID_UPPER = 0.80;

    public function classify(string $pdfPath): PdfType {
        $this->validateFile($pdfPath);
        $totalPages = $this->countPages($pdfPath);
        $textPages = $this->countTextPages($pdfPath, $totalPages);
        if ($totalPages === 0) return PdfType::IMAGE;
        $ratio = $textPages / $totalPages;
        return match (true) { $ratio >= self::HYBRID_UPPER => PdfType::TEXT, $ratio <= self::HYBRID_LOWER => PdfType::IMAGE, default => PdfType::HYBRID };
    }

    public function extractFullText(string $pdfPath): string {
        $this->validateFile($pdfPath);
        $type = $this->classify($pdfPath);
        $totalPages = $this->countPages($pdfPath);
        $fullText = '';
        for ($page = 1; $page <= $totalPages; $page++) {
            $pageText = $this->extractPageText($pdfPath, $page);
            if ($type->requiresOcr() && strlen(trim($pageText)) < self::TEXT_THRESHOLD) {
                $pageText = $this->extractWithOcr($pdfPath, $page);
            }
            $fullText .= "\n\n" . $pageText;
        }
        return trim($fullText);
    }

    public function extractWithOcr(string $pdfPath, int $page = 1): string {
        if (!$this->commandExists('tesseract')) return '';
        $tmpBase = sys_get_temp_dir() . '/rag_p' . $page . '_' . uniqid();
        $padded = sprintf('-%0' . strlen((string) $page) . 'd', $page);
        $pngFile = $tmpBase . $padded . '.png';
        shell_exec(sprintf('pdftoppm -f %d -l %d -r 200 -png %s %s 2>/dev/null', $page, $page, escapeshellarg($pdfPath), escapeshellarg($tmpBase)));
        if (!file_exists($pngFile)) return '';
        $ocrOut = $tmpBase . '_ocr';
        shell_exec(sprintf('tesseract %s %s -l eng+ind --psm 3 2>/dev/null', escapeshellarg($pngFile), escapeshellarg($ocrOut)));
        $result = file_get_contents($ocrOut . '.txt') ?: '';
        @unlink($pngFile); @unlink($ocrOut . '.txt');
        return $result;
    }

    private function countPages(string $pdfPath): int {
        if ($this->commandExists('pdfinfo')) {
            $out = shell_exec('pdfinfo ' . escapeshellarg($pdfPath) . ' 2>/dev/null');
            if (preg_match('/Pages:\s+(\d+)/i', $out ?? '', $m)) return (int) $m[1];
        }
        return 1;
    }

    private function countTextPages(string $pdfPath, int $totalPages): int {
        $count = 0;
        for ($p = 1; $p <= $totalPages; $p++) {
            if (strlen(trim($this->extractPageText($pdfPath, $p))) >= self::TEXT_THRESHOLD) $count++;
        }
        return $count;
    }

    private function extractPageText(string $pdfPath, int $page): string {
        if (!$this->commandExists('pdftotext')) throw new PdfClassificationException('pdftotext missing');
        return shell_exec(sprintf('pdftotext -f %d -l %d %s - 2>/dev/null', $page, $page, escapeshellarg($pdfPath))) ?? '';
    }

    private function validateFile(string $pdfPath): void {
        if (!file_exists($pdfPath) || mime_content_type($pdfPath) !== 'application/pdf') throw new PdfClassificationException("Invalid PDF: {$pdfPath}");
    }

    private function commandExists(string $cmd): bool { return !empty(shell_exec("which {$cmd} 2>/dev/null")); }
}
