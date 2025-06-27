import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle, AlertCircle, Computer, ExternalLink } from 'lucide-react';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

interface ClickOnceeScannerProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

const ClickOnceScanner = ({ onScanComplete }: ClickOnceeScannerProps) => {
  const [sessionId] = useState(() => `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isWaiting, setIsWaiting] = useState(false);
  const [scanReceived, setScanReceived] = useState(false);

  useEffect(() => {
    if (!isWaiting) return;

    console.log('Waiting for ClickOnce scan data with session ID:', sessionId);

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
            manufacturer: scanData.manufacturer || 'Unknown',
            model: scanData.model || 'Unknown',
            serialNumber: scanData.serial_number || 'Unknown',
            warrantyStatus: 'Unknown',
            processor: scanData.processor || 'Unknown',
            ram: scanData.ram_gb || 0,
            storage: scanData.storage_gb || 0,
            tmpVersion: scanData.tmp_version || 'Not Detected',
            secureBootCapable: scanData.secure_boot_capable || false,
            uefiCapable: scanData.uefi_capable || false,
            directxVersion: scanData.directx_version || '11',
            displayResolution: scanData.display_resolution || '1920x1080',
            internetConnection: scanData.internet_connection || false
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

  const downloadClickOnceApp = () => {
    // Use the updated hosted ClickOnce application URL
    const appUrl = `https://gearedit.com.au/win11/public/clickonce/Win11Scanner.application`;
    
    // Open the ClickOnce application URL with session ID
    window.open(`${appUrl}?sessionId=${sessionId}`, '_blank');
    setIsWaiting(true);
  };

  const Instructions = () => (
    <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-4">
      <h3 className="font-semibold text-green-800 flex items-center gap-2">
        <Computer className="h-5 w-5" />
        ClickOnce System Scanner
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">1</Badge>
          <div>
            <p className="font-medium">Launch the ClickOnce application</p>
            <p className="text-gray-600">Click the button below to launch the scanner application</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">2</Badge>
          <div>
            <p className="font-medium">Allow installation if prompted</p>
            <p className="text-gray-600">Windows may ask for permission to install the application</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="outline" className="text-xs">3</Badge>
          <div>
            <p className="font-medium">Wait for automatic scanning</p>
            <p className="text-gray-600">The application will scan your system and send results automatically</p>
          </div>
        </div>
      </div>
      <div className="bg-blue-100 p-3 rounded border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Accurate Results:</strong> This method provides the most accurate system information by running natively on your computer.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          ClickOnce System Scanner
        </CardTitle>
        <CardDescription className="text-gray-700">
          Professional-grade system scanning with full hardware access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isWaiting && !scanReceived ? (
          <div className="space-y-4">
            <Instructions />
            <div className="text-center">
              <Button 
                onClick={downloadClickOnceApp}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Launch System Scanner
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Session ID: {sessionId}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Alternative download: 
                <a 
                  href="https://gearedit.com.au/win11/public/clickonce/win-x64/Win11Scanner.exe" 
                  download
                  className="text-primary hover:underline ml-1"
                >
                  Standalone executable
                </a>
              </p>
            </div>
          </div>
        ) : isWaiting ? (
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Scanning your system...</h3>
              <p className="text-gray-600">Session ID: {sessionId}</p>
              <p className="text-sm text-gray-500 mt-2">The application is gathering detailed system information</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  ClickOnce application provides the most accurate system information available.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-green-600">Scan Complete!</h3>
            <p className="text-gray-600">Processing your comprehensive system information...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClickOnceScanner;
