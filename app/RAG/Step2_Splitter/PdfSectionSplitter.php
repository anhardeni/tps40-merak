<?php
namespace App\RAG\Step2_Splitter;
class PdfSectionSplitter {
    public function splitTextWithSections(string $fullText): array {
        if (empty(trim($fullText))) return ['general' => ''];
        $rules = SectionRules::rules();
        $result = [];
        $lines = explode("\n", $fullText);
        $currentSection = 'general';
        $buffer = '';

        foreach ($lines as $line) {
            $matched = false;
            foreach ($rules as $sectionName => $keywords) {
                foreach ($keywords as $keyword) {
                    if (stripos($line, $keyword) !== false) {
                        if (!empty(trim($buffer))) $result[$currentSection] = ($result[$currentSection] ?? '') . $buffer;
                        $currentSection = $sectionName;
                        $buffer = $line . "\n";
                        $matched = true;
                        break 2;
                    }
                }
            }
            if (!$matched) $buffer .= $line . "\n";
        }
        if (!empty(trim($buffer))) $result[$currentSection] = ($result[$currentSection] ?? '') . $buffer;
        return empty($result) ? ['general' => $fullText] : $result;
    }
}
