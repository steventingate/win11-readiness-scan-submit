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

        if (data && data.length > 0) {
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

  const downloadScript = () => {
    const scriptUrl = '/system-scanner.ps1';
    const link = document.createElement('a');
    link.href = scriptUrl;
    link.download = 'system-scanner.ps1';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsWaiting(true);
  };

  const Instructions = () => (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
      <h3 className="font-semibold text-blue-800 flex items-center gap-2">
        <Computer className="h-5 w-5" />
        Accurate Hardware Detection
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">1</Badge>
          <div>
            <p className="font-medium">Download the PowerShell script</p>
            <p className="text-gray-600">Click the download button below to get the scanner script</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">2</Badge>
          <div>
            <p className="font-medium">Run as Administrator</p>
            <p className="text-gray-600">Right-click the downloaded file and select "Run with PowerShell"</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">3</Badge>
          <div>
            <p className="font-medium">Enter Session ID</p>
            <p className="text-gray-600">Use this ID when prompted: <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">{sessionId}</code></p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">4</Badge>
          <div>
            <p className="font-medium">Wait for results</p>
            <p className="text-gray-600">Results will appear automatically on this page</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          Precise Hardware Analysis
        </CardTitle>
        <CardDescription className="text-gray-700">
          Get 100% accurate system information using our PowerShell scanner
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isWaiting && !scanReceived ? (
          <div className="space-y-4">
            <Instructions />
            <div className="text-center">
              <Button 
                onClick={downloadScript}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PowerShell Scanner
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Session ID: <code className="bg-gray-200 px-2 py-1 rounded">{sessionId}</code>
              </p>
            </div>
          </div>
        ) : isWaiting ? (
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Waiting for scan results...</h3>
              <p className="text-gray-600">Please run the downloaded PowerShell script</p>
              <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Make sure to run the script as Administrator and enter the correct Session ID
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
