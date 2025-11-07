<?php

namespace App\Services\HostTransmission\Contracts;

use App\Models\BeacukaiCredential;
use App\Models\Document;

interface TransmitterInterface
{
    /**
     * Send document to host
     *
     * @return array ['success' => bool, 'message' => string, 'response_data' => array, ...]
     */
    public function send(Document $document, BeacukaiCredential $credential): array;

    /**
     * Validate credential configuration
     */
    public function validateCredential(BeacukaiCredential $credential): bool;

    /**
     * Get transmitter name for logging
     */
    public function getName(): string;
}
