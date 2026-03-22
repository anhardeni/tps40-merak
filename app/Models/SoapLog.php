<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoapLog extends Model
{
    /**
     * The attributes that aren't mass assignable.
     * Empty array means all attributes are mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Mutator to censor passwords in XML requests before inserting into database
     */
    public function setRequestXmlAttribute($value)
    {
        if ($value) {
            // Censor the content between <PassWord> tags
            $value = preg_replace('/(<PassWord>)(.*?)(<\/PassWord>)/i', '$1********$3', $value);
        }
        
        $this->attributes['request_xml'] = $value;
    }
}
