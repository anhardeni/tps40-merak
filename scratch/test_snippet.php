<?php
class X {
     */
    private function parseSoapResponse(string $soapResponse): array
    {
        try {
            $xml = simplexml_load_string($soapResponse);
            $xml->registerXPathNamespace('soap', 'http://schemas.xmlsoap.org/soap/envelope/');

            // Extract result from SOAP response
            $result = $xml->xpath('//CoCoTangkiResult');

            if (! empty($result)) {
                $resultText = trim((string) $result[0]);

                // Beacukai returns an error message when validation fails
                // Success messages typically contain 'berhasil', a doc number, or are empty
                $isError = stripos($resultText, 'tidak benar') !== false
                    || stripos($resultText, 'validasi') !== false
                    || stripos($resultText, 'error') !== false
                    || stripos($resultText, 'gagal') !== false
                    || stripos($resultText, 'failed') !== false;

                if ($isError) {
                    return [
                        'status'  => 'error',
                        'message' => 'Beacukai menolak dokumen: ' . $resultText,
                        'result'  => $resultText,
                    ];
                }

                return [
                    'status'  => 'success',
                    'message' => 'Data berhasil diterima',
                    'result'  => $resultText,
                ];
            }

            return [
                'status'      => 'unknown',
                'message'     => 'Response tidak dapat diparse',
                'raw_response' => $soapResponse,
            ];

        } catch (\Exception $e) {
            return [
                'status'      => 'error',
                'message'     => 'Error parsing response: '.$e->getMessage(),
                'raw_response' => $soapResponse,
            ];
        }
    }

}
