
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
    // Create a dynamic executable that includes the session ID
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
# System Scanner Script
$sessionId = '${sessionId}'
$apiUrl = 'https://sfdiidxypdadqspafvlc.supabase.co/functions/v1/submit-system-scan'

try {
    Write-Host 'Starting system information gathering...' -ForegroundColor Green
    
    # Get system information using CIM (newer than WMI)
    Write-Host 'Getting computer system info...'
    $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
    Write-Host 'Getting processor info...'
    $processor = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
    Write-Host 'Getting memory info...'
    $memory = Get-CimInstance -ClassName Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
    Write-Host 'Getting disk info...'
    $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter 'DriveType=3' | Select-Object -First 1
    Write-Host 'Getting BIOS info...'
    $bios = Get-CimInstance -ClassName Win32_BIOS
    
    # Get TPM information
    Write-Host 'Checking TPM status...'
    $tmpVersion = 'Not Detected'
    try {
        $tpm = Get-CimInstance -Namespace 'Root/CIMv2/Security/MicrosoftTpm' -ClassName Win32_Tpm -ErrorAction SilentlyContinue
        if ($tpm) {
            $tmpVersion = '2.0'
            Write-Host 'TPM 2.0 detected' -ForegroundColor Green
        } else {
            Write-Host 'TPM not detected' -ForegroundColor Yellow
        }
    } catch {
        Write-Host 'Error checking TPM: ' + $_.Exception.Message -ForegroundColor Yellow
    }
    
    # Get display information
    Write-Host 'Getting display info...'
    $display = Get-CimInstance -ClassName Win32_VideoController | Where-Object { $_.Name -notlike '*Remote*' -and $_.Name -notlike '*Virtual*' } | Select-Object -First 1
    $resolution = '1920x1080'
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $screen = [System.Windows.Forms.SystemInformation]::PrimaryMonitorSize
        $resolution = $screen.Width.ToString() + 'x' + $screen.Height.ToString()
    } catch {
        Write-Host 'Could not get exact resolution, using default' -ForegroundColor Yellow
    }
    
    # Check UEFI vs Legacy BIOS
    Write-Host 'Checking firmware type...'
    $uefiCapable = $false
    try {
        $firmwareType = (Get-ComputerInfo -Property BiosFirmwareType).BiosFirmwareType
        if ($firmwareType -eq 'Uefi') {
            $uefiCapable = $true
            Write-Host 'UEFI firmware detected' -ForegroundColor Green
        } else {
            Write-Host 'Legacy BIOS detected' -ForegroundColor Yellow
        }
    } catch {
        Write-Host 'Could not determine firmware type, assuming Legacy BIOS' -ForegroundColor Yellow
    }
    
    # Check Secure Boot capability
    Write-Host 'Checking Secure Boot...'
    $secureBootCapable = $false
    try {
        $secureBootStatus = Confirm-SecureBootUEFI -ErrorAction SilentlyContinue
        $secureBootCapable = $true
        Write-Host 'Secure Boot capable' -ForegroundColor Green
    } catch {
        Write-Host 'Secure Boot not supported or not in UEFI mode' -ForegroundColor Yellow
    }
    
    # Get DirectX version
    Write-Host 'Checking DirectX version...'
    $directxVersion = '11'
    try {
        $dxdiag = Get-ItemProperty 'HKLM:SOFTWARE\Microsoft\DirectX' -Name Version -ErrorAction SilentlyContinue
        if ($dxdiag.Version -like '*12*') {
            $directxVersion = '12'
            Write-Host 'DirectX 12 detected' -ForegroundColor Green
        } else {
            Write-Host 'DirectX 11 or earlier detected' -ForegroundColor Yellow
        }
    } catch {
        Write-Host 'Could not determine DirectX version, assuming 11' -ForegroundColor Yellow
    }
    
    # Check internet connection
    Write-Host 'Testing internet connection...'
    $internetConnection = Test-Connection -ComputerName google.com -Count 1 -Quiet
    if ($internetConnection) {
        Write-Host 'Internet connection: Available' -ForegroundColor Green
    } else {
        Write-Host 'Internet connection: Not available' -ForegroundColor Red
    }
    
    # Prepare data for submission
    $systemData = @{
        sessionId = $sessionId
        manufacturer = $computerSystem.Manufacturer
        model = $computerSystem.Model
        serialNumber = $bios.SerialNumber
        processor = $processor.Name
        ram = [math]::Round(($memory.Sum / 1GB), 0)
        storage = [math]::Round(($disk.Size / 1GB), 0)
        tmpVersion = $tmpVersion
        secureBootCapable = $secureBootCapable
        uefiCapable = $uefiCapable
        directxVersion = $directxVersion
        displayResolution = $resolution
        internetConnection = $internetConnection
    }
    
    Write-Host ''
    Write-Host 'System Information Summary:' -ForegroundColor Cyan
    Write-Host ('Manufacturer: ' + $systemData.manufacturer) -ForegroundColor White
    Write-Host ('Model: ' + $systemData.model) -ForegroundColor White
    Write-Host ('Processor: ' + $systemData.processor) -ForegroundColor White
    Write-Host ('RAM: ' + $systemData.ram + ' GB') -ForegroundColor White
    Write-Host ('Storage: ' + $systemData.storage + ' GB') -ForegroundColor White
    Write-Host ('TPM: ' + $systemData.tmpVersion) -ForegroundColor White
    Write-Host ''
    
    Write-Host 'Sending data to compatibility checker...' -ForegroundColor Yellow
    
    # Convert to JSON
    $jsonData = $systemData | ConvertTo-Json
    Write-Host 'JSON payload prepared' -ForegroundColor Green
    
    # Submit to API
    $headers = @{
        'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGlpZHh5cGRhZHFzcGFmdmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTQxMDcsImV4cCI6MjA2NTM3MDEwN30.w61wrEcAZAcxq3qYzaFFL6sX1aL2H5NaUdsJk0XTWJI'
        'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGlpZHh5cGRhZHFzcGFmdmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTQxMDcsImV4cCI6MjA2NTM3MDEwN30.w61wrEcAZAcxq3qYzaFFL6sX1aL2H5NaUdsJk0XTWJI'
        'Content-Type' = 'application/json'
    }
    
    Write-Host 'Submitting to API...' -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $jsonData -Headers $headers -TimeoutSec 30
    
    Write-Host ''
    Write-Host 'SUCCESS!' -ForegroundColor Green -BackgroundColor Black
    Write-Host 'System information sent successfully to Helpdesk Computers.' -ForegroundColor Green
    Write-Host ('Response: ' + ($response | ConvertTo-Json)) -ForegroundColor White
    Write-Host ''
    Write-Host 'Please return to your web browser to view the compatibility results.' -ForegroundColor Cyan
    
} catch {
    Write-Host ''
    Write-Host 'ERROR OCCURRED!' -ForegroundColor Red -BackgroundColor Black
    Write-Host 'Failed to collect or send system information.' -ForegroundColor Red
    Write-Host ('Error details: ' + $_.Exception.Message) -ForegroundColor Yellow
    Write-Host ('Error type: ' + $_.Exception.GetType().Name) -ForegroundColor Yellow
    if ($_.Exception.InnerException) {
        Write-Host ('Inner error: ' + $_.Exception.InnerException.Message) -ForegroundColor Yellow
    }
    Write-Host ''
    Write-Host 'Please ensure you have:' -ForegroundColor Cyan
    Write-Host '- Administrator privileges (Run as Administrator)' -ForegroundColor White
    Write-Host '- Active internet connection' -ForegroundColor White
    Write-Host '- Windows PowerShell execution policy allows scripts' -ForegroundColor White
    Write-Host ''
    Write-Host 'Contact Helpdesk Computers for assistance if the problem persists.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '======================================'
Write-Host 'Scan completed. Press any key to exit...'
Write-Host '======================================'
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"`;

    const blob = new Blob([executableContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Windows11Scanner.bat';
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
        One-Click System Scanner
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">1</Badge>
          <div>
            <p className="font-medium">Download the scanner</p>
            <p className="text-gray-600">Click the download button to get the one-click scanner</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">2</Badge>
          <div>
            <p className="font-medium">Run as Administrator</p>
            <p className="text-gray-600">Right-click the downloaded file and select "Run as administrator"</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">3</Badge>
          <div>
            <p className="font-medium">Wait for results</p>
            <p className="text-gray-600">Results will appear automatically on this page</p>
          </div>
        </div>
      </div>
      <div className="bg-orange-100 p-3 rounded border border-orange-200">
        <p className="text-orange-800 text-sm">
          <strong>Important:</strong> Run as Administrator for accurate hardware detection. The scanner window will stay open to show detailed progress.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          One-Click System Scanner
        </CardTitle>
        <CardDescription className="text-gray-700">
          Download and run our automated scanner for instant results
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
                Download One-Click Scanner
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Compatible with Windows 10/11 • Run as Administrator for best results
              </p>
            </div>
          </div>
        ) : isWaiting ? (
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Waiting for scan results...</h3>
              <p className="text-gray-600">Session ID: {sessionId}</p>
              <p className="text-sm text-gray-500 mt-2">Please run the downloaded scanner as Administrator</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  The scanner will automatically send results to this page. Keep this browser tab open.
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
