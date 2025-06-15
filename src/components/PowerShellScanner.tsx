
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle, AlertCircle, Computer } from 'lucide-react';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

interface PowerShellScannerProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

const PowerShellScanner = ({ onScanComplete }: PowerShellScannerProps) => {
  const [sessionId] = useState(() => `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isWaiting, setIsWaiting] = useState(false);
  const [scanReceived, setScanReceived] = useState(false);

  useEffect(() => {
    if (!isWaiting) return;

    console.log('Waiting for scan data with session ID:', sessionId);

    const checkForScanData = async () => {
      try {
        const { data, error } = await supabase
          .from('system_scans')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking for scan data:', error);
          return;
        }

        console.log('Checking for scan data, found:', data?.length || 0, 'records');

        if (data && data.length > 0) {
          console.log('Scan data received:', data[0]);
          const scanData = data[0];
          setScanReceived(true);
          setIsWaiting(false);

          // Convert database format to SystemInfo format
          const systemInfo: SystemInfo = {
            manufacturer: scanData.manufacturer,
            model: scanData.model,
            serialNumber: scanData.serial_number,
            warrantyStatus: 'Unknown',
            processor: scanData.processor,
            ram: scanData.ram_gb,
            storage: scanData.storage_gb,
            tmpVersion: scanData.tmp_version,
            secureBootCapable: scanData.secure_boot_capable,
            uefiCapable: scanData.uefi_capable,
            directxVersion: scanData.directx_version,
            displayResolution: scanData.display_resolution,
            internetConnection: scanData.internet_connection
          };

          // Check compatibility
          const compatibilityResult = checkCompatibility(systemInfo);
          onScanComplete(compatibilityResult, systemInfo);
        }
      } catch (error) {
        console.error('Error checking scan data:', error);
      }
    };

    const interval = setInterval(checkForScanData, 2000);
    return () => clearInterval(interval);
  }, [isWaiting, sessionId, onScanComplete]);

  const checkCompatibility = (systemInfo: SystemInfo): CompatibilityResult => {
    const requirements = {
      processor: {
        met: systemInfo.processor.includes('i7-') || 
             systemInfo.processor.includes('i5-') || 
             systemInfo.processor.includes('Ryzen') ||
             systemInfo.processor.includes('8th Gen') ||
             systemInfo.processor.includes('11th Gen'),
        requirement: '1 GHz or faster with 2+ cores on compatible 64-bit processor (8th gen Intel or AMD Ryzen 2000+)',
        current: systemInfo.processor
      },
      ram: {
        met: systemInfo.ram >= 4,
        requirement: '4 GB RAM minimum (8 GB recommended)',
        current: `${systemInfo.ram} GB`
      },
      storage: {
        met: systemInfo.storage >= 64,
        requirement: '64 GB available storage minimum',
        current: `${systemInfo.storage} GB`
      },
      tmp: {
        met: systemInfo.tmpVersion === '2.0',
        requirement: 'TPM version 2.0 (Trusted Platform Module)',
        current: systemInfo.tmpVersion === 'Not Detected' ? 'TPM not detected' : `TPM ${systemInfo.tmpVersion}`
      },
      secureBoot: {
        met: systemInfo.secureBootCapable,
        requirement: 'Secure Boot capable firmware',
        current: systemInfo.secureBootCapable ? 'Supported' : 'Not supported'
      },
      uefi: {
        met: systemInfo.uefiCapable,
        requirement: 'UEFI firmware (Legacy BIOS not supported)',
        current: systemInfo.uefiCapable ? 'UEFI supported' : 'Legacy BIOS detected'
      },
      directx: {
        met: systemInfo.directxVersion === '12',
        requirement: 'DirectX 12 or later with WDDM 2.0 driver',
        current: `DirectX ${systemInfo.directxVersion}`
      },
      display: {
        met: parseInt(systemInfo.displayResolution.split('x')[1]) >= 720,
        requirement: 'High definition (720p) display, 9" diagonal or greater',
        current: systemInfo.displayResolution
      },
      internet: {
        met: systemInfo.internetConnection,
        requirement: 'Internet connectivity for updates and activation',
        current: systemInfo.internetConnection ? 'Connected' : 'Not connected'
      }
    };

    const isCompatible = Object.values(requirements).every(req => req.met);

    return {
      isCompatible,
      requirements
    };
  };

  const downloadExecutable = () => {
    const executableContent = `@echo off
echo ========================================
echo Windows 11 Compatibility Scanner
echo Helpdesk Computers Professional IT
echo ========================================
echo.
echo Session ID: ${sessionId}
echo.
echo Scanning your system...
echo.

powershell.exe -ExecutionPolicy Bypass -Command "
# System Scanner Script with Enhanced Error Logging
$sessionId = '${sessionId}'
$apiUrl = 'https://sfdiidxypdadqspafvlc.supabase.co/functions/v1/submit-system-scan'

Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'ENHANCED DEBUG MODE - System Scanner' -ForegroundColor Cyan
Write-Host 'Session ID: $sessionId' -ForegroundColor Yellow
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

try {
    Write-Host '[INFO] Starting system information gathering...' -ForegroundColor Green
    Write-Host '[DEBUG] PowerShell Version: $($PSVersionTable.PSVersion)' -ForegroundColor Gray
    Write-Host '[DEBUG] Execution Policy: $(Get-ExecutionPolicy)' -ForegroundColor Gray
    Write-Host ''
    
    # Initialize error tracking
    $errors = @()
    $systemData = @{}
    
    # Get computer system info
    Write-Host '[STEP 1] Getting computer system info...' -ForegroundColor Yellow
    try {
        $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction Stop
        Write-Host '[SUCCESS] Computer system info retrieved' -ForegroundColor Green
        Write-Host '[DEBUG] Manufacturer: $($computerSystem.Manufacturer)' -ForegroundColor Gray
        Write-Host '[DEBUG] Model: $($computerSystem.Model)' -ForegroundColor Gray
        $systemData.manufacturer = $computerSystem.Manufacturer
        $systemData.model = $computerSystem.Model
    } catch {
        $errors += '[ERROR] Failed to get computer system info: ' + $_.Exception.Message
        Write-Host '[ERROR] Computer system info failed: $($_.Exception.Message)' -ForegroundColor Red
        $systemData.manufacturer = 'Unknown'
        $systemData.model = 'Unknown'
    }
    
    # Get processor info
    Write-Host '[STEP 2] Getting processor info...' -ForegroundColor Yellow
    try {
        $processor = Get-CimInstance -ClassName Win32_Processor -ErrorAction Stop | Select-Object -First 1
        Write-Host '[SUCCESS] Processor info retrieved' -ForegroundColor Green
        Write-Host '[DEBUG] Processor: $($processor.Name)' -ForegroundColor Gray
        $systemData.processor = $processor.Name
    } catch {
        $errors += '[ERROR] Failed to get processor info: ' + $_.Exception.Message
        Write-Host '[ERROR] Processor info failed: $($_.Exception.Message)' -ForegroundColor Red
        $systemData.processor = 'Unknown Processor'
    }
    
    # Get memory info
    Write-Host '[STEP 3] Getting memory info...' -ForegroundColor Yellow
    try {
        $memory = Get-CimInstance -ClassName Win32_PhysicalMemory -ErrorAction Stop | Measure-Object -Property Capacity -Sum
        $ramGB = [math]::Round(($memory.Sum / 1GB), 0)
        Write-Host '[SUCCESS] Memory info retrieved' -ForegroundColor Green
        Write-Host '[DEBUG] RAM: $ramGB GB' -ForegroundColor Gray
        $systemData.ram = $ramGB
    } catch {
        $errors += '[ERROR] Failed to get memory info: ' + $_.Exception.Message
        Write-Host '[ERROR] Memory info failed: $($_.Exception.Message)' -ForegroundColor Red
        $systemData.ram = 0
    }
    
    # Get disk info
    Write-Host '[STEP 4] Getting disk info...' -ForegroundColor Yellow
    try {
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -ErrorAction Stop | Where-Object {$_.DriveType -eq 3} | Select-Object -First 1
        $storageGB = [math]::Round(($disk.Size / 1GB), 0)
        Write-Host '[SUCCESS] Disk info retrieved' -ForegroundColor Green
        Write-Host '[DEBUG] Storage: $storageGB GB' -ForegroundColor Gray
        $systemData.storage = $storageGB
    } catch {
        $errors += '[ERROR] Failed to get disk info: ' + $_.Exception.Message
        Write-Host '[ERROR] Disk info failed: $($_.Exception.Message)' -ForegroundColor Red
        $systemData.storage = 0
    }
    
    # Get BIOS info
    Write-Host '[STEP 5] Getting BIOS info...' -ForegroundColor Yellow
    try {
        $bios = Get-CimInstance -ClassName Win32_BIOS -ErrorAction Stop
        Write-Host '[SUCCESS] BIOS info retrieved' -ForegroundColor Green
        Write-Host '[DEBUG] Serial Number: $($bios.SerialNumber)' -ForegroundColor Gray
        $systemData.serialNumber = $bios.SerialNumber
    } catch {
        $errors += '[ERROR] Failed to get BIOS info: ' + $_.Exception.Message
        Write-Host '[ERROR] BIOS info failed: $($_.Exception.Message)' -ForegroundColor Red
        $systemData.serialNumber = 'Unknown'
    }
    
    # Get TPM information
    Write-Host '[STEP 6] Checking TPM status...' -ForegroundColor Yellow
    $tmpVersion = 'Not Detected'
    try {
        $tpm = Get-CimInstance -Namespace 'Root/CIMv2/Security/MicrosoftTpm' -ClassName Win32_Tpm -ErrorAction Stop
        if ($tpm) {
            if ($tpm.SpecVersion) {
                $tmpVersion = $tpm.SpecVersion
                Write-Host '[SUCCESS] TPM detected with version: $tmpVersion' -ForegroundColor Green
            } else {
                $tmpVersion = '2.0'
                Write-Host '[SUCCESS] TPM detected (assuming 2.0)' -ForegroundColor Green
            }
        } else {
            Write-Host '[WARNING] TPM object returned but empty' -ForegroundColor Yellow
        }
    } catch {
        Write-Host '[WARNING] TPM not detected or accessible: $($_.Exception.Message)' -ForegroundColor Yellow
    }
    $systemData.tmpVersion = $tmpVersion
    
    # Get display information
    Write-Host '[STEP 7] Getting display info...' -ForegroundColor Yellow
    $resolution = '1920x1080'
    try {
        $display = Get-CimInstance -ClassName Win32_VideoController -ErrorAction Stop | Where-Object { $_.Name -notlike '*Remote*' -and $_.Name -notlike '*Virtual*' } | Select-Object -First 1
        if ($display.CurrentHorizontalResolution -and $display.CurrentVerticalResolution) {
            $resolution = $display.CurrentHorizontalResolution.ToString() + 'x' + $display.CurrentVerticalResolution.ToString()
            Write-Host '[SUCCESS] Display resolution detected: $resolution' -ForegroundColor Green
        } else {
            Write-Host '[WARNING] Could not get exact resolution from video controller, using default' -ForegroundColor Yellow
        }
    } catch {
        Write-Host '[WARNING] Display info failed: $($_.Exception.Message), using default resolution' -ForegroundColor Yellow
    }
    $systemData.displayResolution = $resolution
    
    # Check UEFI vs Legacy BIOS
    Write-Host '[STEP 8] Checking firmware type...' -ForegroundColor Yellow
    $uefiCapable = $false
    try {
        $computerInfo = Get-ComputerInfo -Property BiosFirmwareType -ErrorAction Stop
        if ($computerInfo.BiosFirmwareType -eq 'Uefi') {
            $uefiCapable = $true
            Write-Host '[SUCCESS] UEFI firmware detected' -ForegroundColor Green
        } else {
            Write-Host '[INFO] Legacy BIOS detected' -ForegroundColor Yellow
        }
    } catch {
        Write-Host '[WARNING] Could not determine firmware type: $($_.Exception.Message)' -ForegroundColor Yellow
        # Fallback method
        if (Test-Path 'HKLM:\SYSTEM\CurrentControlSet\Control\SecureBoot') {
            $uefiCapable = $true
            Write-Host '[INFO] UEFI detected via registry fallback' -ForegroundColor Green
        }
    }
    $systemData.uefiCapable = $uefiCapable
    
    # Check Secure Boot capability
    Write-Host '[STEP 9] Checking Secure Boot...' -ForegroundColor Yellow
    $secureBootCapable = $false
    try {
        $secureBootStatus = Confirm-SecureBootUEFI -ErrorAction Stop
        $secureBootCapable = $true
        Write-Host '[SUCCESS] Secure Boot capable (status: $secureBootStatus)' -ForegroundColor Green
    } catch {
        Write-Host '[INFO] Secure Boot not supported or not in UEFI mode: $($_.Exception.Message)' -ForegroundColor Yellow
    }
    $systemData.secureBootCapable = $secureBootCapable
    
    # Get DirectX version
    Write-Host '[STEP 10] Checking DirectX version...' -ForegroundColor Yellow
    $directxVersion = '11'
    try {
        $dxdiag = Get-ItemProperty 'HKLM:SOFTWARE\Microsoft\DirectX' -Name Version -ErrorAction Stop
        if ($dxdiag.Version -like '*12*') {
            $directxVersion = '12'
            Write-Host '[SUCCESS] DirectX 12 detected' -ForegroundColor Green
        } else {
            Write-Host '[INFO] DirectX 11 or earlier detected' -ForegroundColor Yellow
        }
    } catch {
        Write-Host '[WARNING] Could not determine DirectX version: $($_.Exception.Message)' -ForegroundColor Yellow
    }
    $systemData.directxVersion = $directxVersion
    
    # Check internet connection
    Write-Host '[STEP 11] Testing internet connection...' -ForegroundColor Yellow
    try {
        $internetConnection = Test-Connection -ComputerName 'google.com' -Count 1 -Quiet -ErrorAction Stop
        if ($internetConnection) {
            Write-Host '[SUCCESS] Internet connection: Available' -ForegroundColor Green
        } else {
            Write-Host '[WARNING] Internet connection: Not available' -ForegroundColor Red
        }
        $systemData.internetConnection = $internetConnection
    } catch {
        Write-Host '[ERROR] Internet test failed: $($_.Exception.Message)' -ForegroundColor Red
        $systemData.internetConnection = $false
    }
    
    # Add session ID
    $systemData.sessionId = $sessionId
    
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host 'SYSTEM INFORMATION SUMMARY' -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host ('Manufacturer: ' + $systemData.manufacturer) -ForegroundColor White
    Write-Host ('Model: ' + $systemData.model) -ForegroundColor White
    Write-Host ('Serial Number: ' + $systemData.serialNumber) -ForegroundColor White
    Write-Host ('Processor: ' + $systemData.processor) -ForegroundColor White
    Write-Host ('RAM: ' + $systemData.ram + ' GB') -ForegroundColor White
    Write-Host ('Storage: ' + $systemData.storage + ' GB') -ForegroundColor White
    Write-Host ('TPM: ' + $systemData.tmpVersion) -ForegroundColor White
    Write-Host ('UEFI: ' + $systemData.uefiCapable) -ForegroundColor White
    Write-Host ('Secure Boot: ' + $systemData.secureBootCapable) -ForegroundColor White
    Write-Host ('DirectX: ' + $systemData.directxVersion) -ForegroundColor White
    Write-Host ('Resolution: ' + $systemData.displayResolution) -ForegroundColor White
    Write-Host ('Internet: ' + $systemData.internetConnection) -ForegroundColor White
    Write-Host ''
    
    if ($errors.Count -gt 0) {
        Write-Host 'ERRORS ENCOUNTERED:' -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host $error -ForegroundColor Red
        }
        Write-Host ''
    }
    
    Write-Host '[API] Converting data to JSON...' -ForegroundColor Yellow
    try {
        $jsonData = $systemData | ConvertTo-Json -Depth 3
        Write-Host '[SUCCESS] JSON payload prepared' -ForegroundColor Green
        Write-Host '[DEBUG] JSON Length: $($jsonData.Length) characters' -ForegroundColor Gray
    } catch {
        throw 'Failed to convert data to JSON: ' + $_.Exception.Message
    }
    
    Write-Host '[API] Preparing headers...' -ForegroundColor Yellow
    $headers = @{
        'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGlpZHh5cGRhZHFzcGFmdmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTQxMDcsImV4cCI6MjA2NTM3MDEwN30.w61wrEcAZAcxq3qYzaFFL6sX1aL2H5NaUdsJk0XTWJI'
        'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGlpZHh5cGRhZHFzcGFmdmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTQxMDcsImV4cCI6MjA2NTM3MDEwN30.w61wrEcAZAcxq3qYzaFFL6sX1aL2H5NaUdsJk0XTWJI'
        'Content-Type' = 'application/json'
    }
    
    Write-Host '[API] Submitting to: $apiUrl' -ForegroundColor Yellow
    Write-Host '[API] Timeout: 30 seconds' -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30 -ErrorAction Stop
        
        Write-Host ''
        Write-Host '========================================' -ForegroundColor Green
        Write-Host 'SUCCESS!' -ForegroundColor Green -BackgroundColor Black
        Write-Host '========================================' -ForegroundColor Green
        Write-Host 'System information sent successfully to Helpdesk Computers.' -ForegroundColor Green
        Write-Host ('API Response: ' + ($response | ConvertTo-Json -Compress)) -ForegroundColor White
        Write-Host ''
        Write-Host 'Please return to your web browser to view the compatibility results.' -ForegroundColor Cyan
        
    } catch [System.Net.WebException] {
        Write-Host ''
        Write-Host 'NETWORK ERROR!' -ForegroundColor Red -BackgroundColor Black
        Write-Host 'Failed to connect to the API server.' -ForegroundColor Red
        Write-Host ('Network Error: ' + $_.Exception.Message) -ForegroundColor Yellow
        if ($_.Exception.Response) {
            Write-Host ('HTTP Status: ' + $_.Exception.Response.StatusCode) -ForegroundColor Yellow
        }
        Write-Host 'Please check your internet connection and try again.' -ForegroundColor Yellow
    } catch {
        Write-Host ''
        Write-Host 'API SUBMISSION ERROR!' -ForegroundColor Red -BackgroundColor Black
        Write-Host 'Failed to send system information to the server.' -ForegroundColor Red
        Write-Host ('API Error: ' + $_.Exception.Message) -ForegroundColor Yellow
        if ($_.Exception.Response) {
            try {
                $responseContent = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($responseContent)
                $responseText = $reader.ReadToEnd()
                Write-Host ('Server Response: ' + $responseText) -ForegroundColor Yellow
            } catch {
                Write-Host 'Could not read server response' -ForegroundColor Yellow
            }
        }
    }
    
} catch {
    Write-Host ''
    Write-Host 'CRITICAL ERROR OCCURRED!' -ForegroundColor Red -BackgroundColor Black
    Write-Host 'An unexpected error occurred during system scanning.' -ForegroundColor Red
    Write-Host ('Error Type: ' + $_.Exception.GetType().Name) -ForegroundColor Yellow
    Write-Host ('Error Message: ' + $_.Exception.Message) -ForegroundColor Yellow
    if ($_.Exception.InnerException) {
        Write-Host ('Inner Error: ' + $_.Exception.InnerException.Message) -ForegroundColor Yellow
    }
    Write-Host ('Stack Trace: ' + $_.ScriptStackTrace) -ForegroundColor Gray
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'DEBUG SESSION COMPLETE' -ForegroundColor Cyan
Write-Host 'Session ID: $sessionId' -ForegroundColor Yellow
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'PLEASE COPY ALL THE TEXT ABOVE AND SHARE IT' -ForegroundColor Magenta -BackgroundColor Black
Write-Host 'This will help us debug the issue.' -ForegroundColor Magenta
Write-Host ''
Write-Host 'Press any key to exit...' -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"`;

    const blob = new Blob([executableContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Windows11Scanner_DEBUG.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsWaiting(true);
  };

  const Instructions = () => (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
      <h3 className="font-semibold text-blue-800 flex items-center gap-2">
        <Computer className="h-5 w-5" />
        Debug System Scanner
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">1</Badge>
          <div>
            <p className="font-medium">Download the debug scanner</p>
            <p className="text-gray-600">This version includes detailed error logging</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">2</Badge>
          <div>
            <p className="font-medium">Run as Administrator</p>
            <p className="text-gray-600">Right-click and select "Run as administrator"</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">3</Badge>
          <div>
            <p className="font-medium">Copy the output</p>
            <p className="text-gray-600">The window will stay open - copy ALL the text and paste it here</p>
          </div>
        </div>
      </div>
      <div className="bg-red-100 p-3 rounded border border-red-200">
        <p className="text-red-800 text-sm">
          <strong>Debug Mode:</strong> The console window will stay open with detailed logs. Please copy and share the entire output.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          Debug System Scanner
        </CardTitle>
        <CardDescription className="text-gray-700">
          Enhanced scanner with detailed error logging for debugging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isWaiting && !scanReceived ? (
          <div className="space-y-4">
            <Instructions />
            <div className="text-center">
              <Button 
                onClick={downloadExecutable}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Debug Scanner
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Session ID: {sessionId}
              </p>
            </div>
          </div>
        ) : isWaiting ? (
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Waiting for scan results...</h3>
              <p className="text-gray-600">Session ID: {sessionId}</p>
              <p className="text-sm text-gray-500 mt-2">Please run the debug scanner and share the output</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  The debug scanner will show detailed logs. Copy and paste the entire output here.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-green-600">Scan Complete!</h3>
            <p className="text-gray-600">Processing your system information...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PowerShellScanner;
