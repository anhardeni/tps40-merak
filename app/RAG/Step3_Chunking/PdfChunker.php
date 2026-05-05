<?php
namespace App\RAG\Step3_Chunking;
use App\RAG\Config\RagConfig;
use App\RAG\Step3_Chunking\Dto\PdfChunk;

class PdfChunker {
    private int $chunkSize;
    private int $overlapSize;

    public function __construct(int $chunkSize = null, int $overlapSize = 100) {
        $this->chunkSize = $chunkSize ?? RagConfig::chunkSize();
        $this->overlapSize = $overlapSize;
    }

    public function chunk(string $section, string $text): array {
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', ' ', $text);
        $text = trim(preg_replace('/[ \t]+/', ' ', $text));
        if (empty($text)) return [];

        $paragraphs = preg_split('/\n{2,}/', $text);
        $chunks = []; $buffer = ''; $index = 0;

        foreach ($paragraphs as $para) {
            $para = trim($para);
            if (strlen($para) < 30) continue;

            if (strlen($buffer) + strlen($para) > $this->chunkSize) {
                if (!empty(trim($buffer))) $chunks[] = new PdfChunk($section, trim($buffer), $index++);
                $buffer = mb_substr($buffer, -$this->overlapSize) . "\n\n" . $para;
            } else {
                $buffer .= "\n\n" . $para;
            }
        }
        if (!empty(trim($buffer))) $chunks[] = new PdfChunk($section, trim($buffer), $index);
        return $chunks;
    }

    public function chunkAll(array $sectionTexts): array {
        $all = [];
        foreach ($sectionTexts as $section => $text) {
            foreach ($this->chunk($section, $text) as $chunk) $all[] = $chunk;
        }
        return $all;
    }
}
