<?php
namespace App\RAG\Step2_Splitter;
class SectionRules {
    public static function rules(): array {
        return [
            'surat_permohonan' => ['Permohonan', 'Surat Permohonan', 'Kepada Yth'],
            'invoice' => ['INVOICE', 'Commercial Invoice'],
            'packing_list' => ['PACKING LIST', 'NET WEIGHT', 'GROSS WEIGHT'],
            'bill_of_lading' => ['BILL OF LADING', 'B/L', 'CONSIGNEE'],
            'airway_bill' => ['AIRWAY BILL', 'AIR WAYBILL', 'AWB'],
            'certificate_origin' => ['CERTIFICATE OF ORIGIN', 'FORM D', 'SKA'],
            'chapter_notes' => ['Chapter Notes', 'CHAPTER NOTES'],
            'section_notes' => ['Section Notes', 'SECTION NOTES'],
            'explanatory_notes' => ['Explanatory Notes', 'This heading covers'],
            'general_rules' => ['General Rules', 'GRI'],
            'heading' => ['heading', 'subheading', 'HS Code'],
            'exclusion' => ['excludes', 'does not cover', 'This heading does not'],
            'ruling_background' => ['BACKGROUND', 'Background:', 'The merchandise'],
            'ruling_issue' => ['ISSUE', 'Issue:', 'The issue is'],
            'ruling_law' => ['LAW AND ANALYSIS', 'Law and Analysis', 'HTSUS'],
            'ruling_holding' => ['HOLDING', 'Holding:', 'is classified'],
        ];
    }
}
