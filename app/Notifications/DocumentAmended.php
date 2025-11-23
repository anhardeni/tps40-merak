<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
use App\Models\Document;

class DocumentAmended extends Notification
{
    use Queueable;

    public function __construct(protected Document $document, protected $actor)
    {
        // actor can be User or string
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'document_id' => $this->document->id,
            'ref_number' => $this->document->ref_number,
            'message' => 'Dokumen telah diubah (tambah tangki) dan diberi status AMENDED',
            'actor_id' => is_object($this->actor) && property_exists($this->actor, 'id') ? $this->actor->id : null,
            'actor_name' => is_object($this->actor) && property_exists($this->actor, 'name') ? $this->actor->name : (string) $this->actor,
            'timestamp' => now()->toDateTimeString(),
        ];
    }
}
