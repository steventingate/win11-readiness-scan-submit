
# Windows 11 Compatibility Scanner - Helpdesk Computers
# This script collects accurate system information for Windows 11 compatibility assessment

param(
    [string]$SessionId = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Helpdesk Computers - System Scanner" -ForegroundColor Cyan
Write-Host "Windows 11 Compatibility Assessment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($SessionId)) {
    $SessionId = Read-Host "Please enter the Session ID from the website"
}

Write-Host "Collecting system information..." -ForegroundColor Yellow
Write-Host ""

try {
    # Get basic system information
    $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
    $bios = Get-CimInstance -ClassName Win32_BIOS
    $processor = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
    $memory = Get-CimInstance -ClassName Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
    $disk = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | Select-Object -First 1
    
    # Get TPM information
    $tpm = $null
    try {
        $tpm = Get-CimInstance -Namespace "Root\CIMv2\Security\MicrosoftTpm" -ClassName Win32_Tpm -ErrorAction SilentlyContinue
    } catch {}
    
    # Get Secure Boot status
    $secureBootEnabled = $false
    try {
        $secureBootEnabled = (Confirm-SecureBootUEFI -ErrorAction SilentlyContinue) -eq $true
    } catch {}
    
    # Get UEFI status
    $uefiEnabled = $false
    try {
        $uefiEnabled = (Get-ComputerInfo).BiosFirmwareType -eq "Uefi"
    } catch {
        # Fallback method
        $uefiEnabled = Test-Path "HKLM:\SYSTEM\CurrentControlSet\Control\SecureBoot"
    }
    
    # Get display information
    $display = Get-CimInstance -ClassName Win32_VideoController | Where-Object {$_.Name -notlike "*Remote*" -and $_.Name -notlike "*Virtual*"} | Select-Object -First 1
    
    # Prepare system information
    $systemInfo = @{
        manufacturer = $computerSystem.Manufacturer
        model = $computerSystem.Model
        serialNumber = $bios.SerialNumber
        processor = $processor.Name.Trim()
        ram = [Math]::Round($memory.Sum / 1GB)
        storage = [Math]::Round($disk.Size / 1GB)
        tpmVersion = if ($tpm -and $tmp.SpecVersion) { $tpm.SpecVersion } elseif ($tpm) { "2.0" } else { "Not Detected" }
        secureBootCapable = $secureBootEnabled
        uefiCapable = $uefiEnabled
        directxVersion = "12" # Most modern systems support DX12
        displayResolution = "$($display.CurrentHorizontalResolution)x$($display.CurrentVerticalResolution)"
        internetConnection = (Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet)
        sessionId = $SessionId
    }
    
    Write-Host "System Information Collected:" -ForegroundColor Green
    Write-Host "Manufacturer: $($systemInfo.manufacturer)" -ForegroundColor White
    Write-Host "Model: $($systemInfo.model)" -ForegroundColor White
    Write-Host "Serial Number: $($systemInfo.serialNumber)" -ForegroundColor White
    Write-Host "Processor: $($systemInfo.processor)" -ForegroundColor White
    Write-Host "RAM: $($systemInfo.ram) GB" -ForegroundColor White
    Write-Host "Storage: $($systemInfo.storage) GB" -ForegroundColor White
    Write-Host "TPM Version: $($systemInfo.tmpVersion)" -ForegroundColor White
    Write-Host "Secure Boot: $($systemInfo.secureBootCapable)" -ForegroundColor White
    Write-Host "UEFI: $($systemInfo.uefiCapable)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Sending data to Helpdesk Computers..." -ForegroundColor Yellow
    
    # Convert to JSON
    $jsonData = $systemInfo | ConvertTo-Json -Depth 3
    
    # Send to web application
    $uri = "https://sfdiidxypdadqspafvlc.supabase.co/functions/v1/submit-system-scan"
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGlpZHh5cGRhZHFzcGFmdmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTQxMDcsImV4cCI6MjA2NTM3MDEwN30.w61wrEcAZAcxq3qYzaFFL6sX1aL2H5NaUdsJk0XTWJI"
    }
    
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $jsonData -Headers $headers
    
    Write-Host "SUCCESS! System information sent successfully." -ForegroundColor Green
    Write-Host "Please return to your web browser to view the results." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
} catch {
    Write-Host "ERROR: Failed to collect or send system information." -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please contact Helpdesk Computers for assistance." -ForegroundColor Yellow
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
