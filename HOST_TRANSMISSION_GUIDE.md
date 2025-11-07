# Host-to-Host Transmission System

## Overview

The Host-to-Host Transmission System provides a comprehensive solution for sending documents to Beacukai's host system using either **XML SOAP 1.2** or **JSON Bearer Token** formats. The system includes automatic retry with exponential backoff, SSL certificate support, and token lifecycle management.

## Architecture

### Components

```
HostTransmissionService (Orchestrator)
    ├── XmlSoapTransmitter (XML SOAP 1.2)
    │   └── XmlJsonGeneratorService
    ├── JsonBearerTransmitter (JSON Bearer Token)
    │   ├── TokenManager (Token Lifecycle)
    │   └── XmlJsonGeneratorService
    └── RetryHandler (Exponential Backoff)
```

### Key Features

- **Dual Format Support**: XML SOAP 1.2 and JSON Bearer Token
- **Automatic Retry**: 3 attempts with exponential backoff (1s, 3s, 9s)
- **Token Management**: Automatic token caching, refresh, and re-login
- **SSL/TLS Support**: Mutual TLS with client certificates
- **Error Detection**: Smart error detection and retry logic
- **Comprehensive Logging**: Detailed logs for debugging and audit

## Transmission Formats

### 1. XML SOAP 1.2 (`soap_xml`)

**Authentication**: Embedded in SOAP body (Username/Password)  
**Protocol**: SOAP 1.2 with fStream CDATA wrapper  
**Endpoint**: `https://tpsonline.beacukai.go.id/tps/service.asmx`

**SOAP Envelope Structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope" 
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap12:Body>
        <CoCoTangki xmlns="http://services.beacukai.go.id/">
            <fStream><![CDATA[
                <DOCUMENT>
                    <!-- Your XML content here -->
                </DOCUMENT>
            ]]></fStream>
            <Username>TPSDEMO</Username>
            <Password>demo123</Password>
        </CoCoTangki>
    </soap12:Body>
</soap12:Envelope>
```

**Response Structure**:
```xml
<soap12:Envelope>
    <soap12:Body>
        <ns:CoCoTangkiResponse>
            <ns:CoCoTangkiResult>
                <!-- Response message -->
            </ns:CoCoTangkiResult>
        </ns:CoCoTangkiResponse>
    </soap12:Body>
</soap12:Envelope>
```

### 2. JSON Bearer Token (`json_bearer`)

**Authentication**: Bearer Token (24-hour expiry with refresh)  
**Protocol**: HTTP POST with JSON body  
**Endpoint**: `https://tpsonline.beacukai.go.id/api/tps/json`

**Token Lifecycle**:
1. **Login**: POST to `/api/auth/login` → Get `access_token` + `refresh_token`
2. **Cache**: Store token in `BeacukaiCredential.additional_config`
3. **Auto-refresh**: Refresh 5 minutes before expiry
4. **Fallback**: Re-login if refresh fails

**Request Structure**:
```json
POST /api/tps/json
Headers:
    Content-Type: application/json
    Authorization: Bearer eyJhbGc...
    Accept: application/json

Body:
{
    "CAR": "IDJKT",
    "Ref_number": "REF-20231102-001",
    // ... document data
}
```

## Configuration

### BeacukaiCredential Table

Each transmission format requires a credential record:

#### XML SOAP Credential
```php
[
    'service_name' => 'Host-to-Host XML',
    'service_type' => 'soap_xml',
    'endpoint_url' => 'https://tpsonline.beacukai.go.id/tps/service.asmx',
    'username' => 'YOUR_USERNAME',
    'password' => 'YOUR_PASSWORD', // Encrypted automatically
    'is_active' => true,
    'additional_config' => [
        'timeout' => 30,
        'ssl_cert_path' => 'certificates/client.pem',
        'ssl_key_path' => 'certificates/client.key',
        'ssl_verify' => true,
    ],
]
```

#### JSON Bearer Credential
```php
[
    'service_name' => 'Host-to-Host JSON',
    'service_type' => 'json_bearer',
    'endpoint_url' => 'https://tpsonline.beacukai.go.id/api/tps/json',
    'username' => 'YOUR_USERNAME',
    'password' => 'YOUR_PASSWORD',
    'is_active' => true,
    'additional_config' => [
        'auth_endpoint' => 'https://tpsonline.beacukai.go.id/api/auth/login',
        'refresh_endpoint' => 'https://tpsonline.beacukai.go.id/api/auth/refresh',
        'token_field' => 'access_token',
        'refresh_token_field' => 'refresh_token',
        'expires_in_field' => 'expires_in',
        'default_expiry' => 86400, // 24 hours
        'timeout' => 30,
        'ssl_cert_path' => 'certificates/client.pem',
        'ssl_key_path' => 'certificates/client.key',
        'ssl_verify' => true,
    ],
]
```

### SSL Certificates

Place your client certificates in `storage/certificates/`:

```
storage/
└── certificates/
    ├── client.pem  (Certificate)
    └── client.key  (Private Key)
```

## Usage

### API Endpoint

```php
POST /api/documents/{id}/send-to-host
```

**Request Body**:
```json
{
    "format": "xml"  // or "json"
}
```

**Response (Success)**:
```json
{
    "success": true,
    "message": "Document sent to host successfully",
    "format": "xml",
    "transmitter": "XML SOAP 1.2 Transmitter",
    "response_time": 1234.56,
    "transmission_size": 12345,
    "host_response": { ... }
}
```

**Response (Error)**:
```json
{
    "success": false,
    "message": "Failed to send to host: Connection timeout"
}
```

### Frontend Integration

```typescript
// In Documents/Show.tsx
const handleSendToHost = async (format: 'xml' | 'json') => {
    try {
        const response = await fetch(`/api/documents/${document.id}/send-to-host`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format })
        });
        
        const data = await response.json();
        
        if (data.success) {
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error('Failed to send to host');
    }
};
```

### Programmatic Usage

```php
use App\Services\HostTransmission\HostTransmissionService;
use App\Services\HostTransmission\RetryHandler;

// Initialize services
$hostService = app(HostTransmissionService::class);
$retryHandler = app(RetryHandler::class);

// Send document with XML format
$document = Document::findOrFail($id);

$result = $retryHandler->execute(
    callback: fn() => $hostService->send($document, 'xml'),
    context: [
        'document_id' => $document->id,
        'format' => 'xml',
    ]
);

// Check result
if ($result['success']) {
    echo "Sent successfully!";
    echo "Response time: {$result['response_time']} ms";
}
```

## Retry Logic

### Retry Strategy

**Attempts**: 3 maximum  
**Delays**: Exponential backoff (1s, 3s, 9s)  
**Formula**: `baseDelay * (multiplier ^ (attempt - 1))`

### Retryable Errors

✅ **Will Retry**:
- Network/connection errors
- DNS resolution failures
- Request timeouts
- 5xx server errors
- 401 Unauthorized (first attempt only - for token refresh)

❌ **Won't Retry**:
- 4xx client errors (except 401)
- Authentication failures (after token refresh)
- Validation errors
- Invalid format errors

### Example Retry Scenario

```
Attempt 1 (t=0s)     → Network timeout
Wait 1s
Attempt 2 (t=1s)     → 503 Service Unavailable
Wait 3s
Attempt 3 (t=4s)     → Success!
Total time: ~4s
```

## Token Management (JSON)

### Token Caching

Tokens are cached in `BeacukaiCredential.additional_config`:

```json
{
    "cached_token": "eyJhbGc...",
    "cached_refresh_token": "dGhpcyBp...",
    "token_expires_at": "2025-11-03T10:30:00+07:00"
}
```

### Automatic Refresh

- **Buffer**: 5 minutes before expiry
- **Trigger**: Any token access within expiry window
- **Fallback**: Re-login if refresh fails
- **Error Handling**: 401 responses trigger automatic token refresh

### Manual Token Management

```php
use App\Services\HostTransmission\TokenManager;

$tokenManager = app(TokenManager::class);
$credential = BeacukaiCredential::getByService('Host-to-Host JSON');

// Get valid token (auto-refresh if needed)
$token = $tokenManager->getValidToken($credential);

// Force refresh
$token = $tokenManager->refreshToken($credential);

// Clear cached token
$tokenManager->clearToken($credential);
```

## Testing

### Test Connection

```php
$hostService = app(HostTransmissionService::class);

// Test XML connection
$xmlTest = $hostService->testConnection('xml');
// Returns: ['success' => true, 'message' => 'Configuration valid', ...]

// Test JSON connection (includes token acquisition)
$jsonTest = $hostService->testConnection('json');
// Returns: ['success' => true, 'has_token' => true, ...]
```

### Tinker Examples

```php
// Check credentials
$xmlCred = \App\Models\BeacukaiCredential::where('service_type', 'soap_xml')->first();
$jsonCred = \App\Models\BeacukaiCredential::where('service_type', 'json_bearer')->first();

// Initialize service
$hostService = app(\App\Services\HostTransmission\HostTransmissionService::class);

// Test connection
$xmlTest = $hostService->testConnection('xml');
$jsonTest = $hostService->testConnection('json');

// Send document (with retry)
$document = \App\Models\Document::where('status', 'APPROVED')->first();
$retryHandler = app(\App\Services\HostTransmission\RetryHandler::class);
$result = $retryHandler->execute(
    fn() => $hostService->send($document, 'xml')
);
```

## Troubleshooting

### Common Issues

#### 1. SSL Certificate Error

**Error**: `SSL certificate problem: unable to get local issuer certificate`

**Solution**:
- Check certificate paths in `additional_config`
- Verify certificate files exist in `storage/certificates/`
- For testing, temporarily set `'ssl_verify' => false`

#### 2. Token Expired (JSON)

**Error**: `401 Unauthorized`

**Solution**: Automatic! Token refresh is handled automatically.

**Manual Fix**:
```php
$tokenManager->clearToken($credential);
$tokenManager->getValidToken($credential); // Forces re-login
```

#### 3. Connection Timeout

**Error**: `Connection timed out after 30000 milliseconds`

**Solution**:
- Increase timeout in `additional_config`
- Check network connectivity
- Verify endpoint URL is correct

#### 4. Invalid Credential

**Error**: `Invalid credential configuration`

**Solution**:
- Check credential is active: `$credential->is_active === true`
- Verify service_type matches format: `soap_xml` or `json_bearer`
- Check required fields are present

### Debug Logging

All transmission activity is logged:

```bash
# View logs
tail -f storage/logs/laravel.log | grep "HostTransmission"

# Search for specific document
grep "document_id.*123" storage/logs/laravel.log
```

**Log Levels**:
- `INFO`: Successful operations, retry attempts
- `WARNING`: Token expiry, retry warnings
- `ERROR`: Transmission failures, configuration errors

## Production Checklist

Before going to production:

- [ ] Update credentials in `beacukai_credentials` table
- [ ] Replace demo endpoints with production URLs
- [ ] Install SSL client certificates in `storage/certificates/`
- [ ] Test XML transmission with real document
- [ ] Test JSON transmission with real document
- [ ] Verify token refresh mechanism
- [ ] Set up log monitoring/alerts
- [ ] Configure proper `ssl_verify => true`
- [ ] Test retry logic with various error scenarios
- [ ] Document any environment-specific configurations

## API Endpoints Summary

| Format | Purpose | Endpoint | Auth Method |
|--------|---------|----------|-------------|
| XML | Document Transmission | `/tps/service.asmx` | Embedded in SOAP |
| JSON | Login | `/api/auth/login` | Username/Password |
| JSON | Refresh Token | `/api/auth/refresh` | Refresh Token |
| JSON | Document Transmission | `/api/tps/json` | Bearer Token |

---

**Version**: 1.0  
**Last Updated**: November 2, 2025  
**Maintainer**: TPS Online Team

