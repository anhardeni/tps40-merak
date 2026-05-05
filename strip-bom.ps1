# strip-bom.ps1
# Run this script after any AI edit to remove UTF-8 BOM from PHP files
# Usage: .\strip-bom.ps1
# Or for a specific file: .\strip-bom.ps1 -Path "app\Services\CoCoTangkiService.php"

param(
    [string]$Path = ""
)

function Remove-BOM {
    param([string]$FilePath)
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $noBom = $bytes[3..($bytes.Length - 1)]
        [System.IO.File]::WriteAllBytes($FilePath, $noBom)
        Write-Host "BOM removed: $FilePath" -ForegroundColor Green
        return $true
    }
    return $false
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($Path -ne "") {
    $fullPath = Join-Path $root $Path
    if (Test-Path $fullPath) {
        Remove-BOM $fullPath
    } else {
        Write-Host "File not found: $fullPath" -ForegroundColor Red
    }
} else {
    # Scan all PHP files in app/ directory
    $phpFiles = Get-ChildItem -Path (Join-Path $root "app") -Filter "*.php" -Recurse
    $count = 0
    foreach ($file in $phpFiles) {
        if (Remove-BOM $file.FullName) { $count++ }
    }
    if ($count -eq 0) {
        Write-Host "No BOM found in any PHP files." -ForegroundColor Cyan
    } else {
        Write-Host "`nTotal files fixed: $count" -ForegroundColor Yellow
    }
}
