<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // WorkOS - Not used (using Laravel Breeze for authentication)
    // 'workos' => [
    //     'client_id' => env('WORKOS_CLIENT_ID'),
    //     'secret' => env('WORKOS_API_KEY'),
    //     'redirect_url' => env('WORKOS_REDIRECT_URL'),
    // ],

    'soap' => [
        'endpoint' => env('SOAP_ENDPOINT', 'https://tpsonline.beacukai.go.id/tps/service.asmx'),
        'username' => env('SOAP_USERNAME'),
        'password' => env('SOAP_PASSWORD'),
        'timeout' => env('SOAP_TIMEOUT', 30),
    ],

    'host_to_host' => [
        'endpoint' => env('HOST_TO_HOST_ENDPOINT'),
        'username' => env('HOST_TO_HOST_USERNAME'),
        'password' => env('HOST_TO_HOST_PASSWORD'),
        'certificate_path' => env('HOST_TO_HOST_CERT_PATH'),
        'private_key_path' => env('HOST_TO_HOST_KEY_PATH'),
    ],

    'cocotangki' => [
        'endpoint' => env('COCOTANGKI_ENDPOINT', 'https://tpsonline.beacukai.go.id/cocotangki/service.asmx'),
        'timeout' => env('COCOTANGKI_TIMEOUT', 30),
        'username' => env('COCOTANGKI_USERNAME'),
        'password' => env('COCOTANGKI_PASSWORD'),
    ],

];
