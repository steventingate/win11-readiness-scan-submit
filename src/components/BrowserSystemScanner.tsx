
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Computer, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

interface BrowserSystemScannerProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

const BrowserSystemScanner = ({ onScanComplete }: BrowserSystemScannerProps) => {
  const [sessionId] = useState(() => `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<Partial<SystemInfo>>({});

  const detectSystemInfo = async () => {
    setIsScanning(true);
    
    const systemInfo: Partial<SystemInfo> = {
      manufacturer: 'Unknown',
      model: 'Unknown',
      serialNumber: 'Browser-Detected',
      warrantyStatus: 'Unknown'
    };

    try {
      // Get basic system info from navigator
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      // Detect OS and basic info
      if (userAgent.includes('Windows NT 10.0')) {
        systemInfo.model = 'Windows 10/11 Computer';
      } else if (userAgent.includes('Windows')) {
        systemInfo.model = 'Windows Computer';
      } else if (userAgent.includes('Mac')) {
        systemInfo.model = 'Mac Computer';
        systemInfo.manufacturer = 'Apple';
      }

      // Get memory info (approximate)
      if ('deviceMemory' in navigator) {
        systemInfo.ram = (navigator as any).deviceMemory || 4;
      } else {
        systemInfo.ram = 8; // Default assumption
      }

      // Get processor info
      systemInfo.processor = `${navigator.hardwareConcurrency || 4}-core processor`;

      // Storage - we can't detect this accurately in browser
      systemInfo.storage = 256; // Default assumption

      // Security features - assume modern defaults
      systemInfo.tmpVersion = '2.0';
      systemInfo.secureBootCapable = true;
      systemInfo.uefiCapable = true;
      systemInfo.directxVersion = '12';
      
      // Display resolution
      systemInfo.displayResolution = `${screen.width}x${screen.height}`;
      
      // Internet connection
      systemInfo.internetConnection = navigator.onLine;

      setDetectedInfo(systemInfo);
      
      // Submit to database
      await submitSystemData(systemInfo as SystemInfo);
      
    } catch (error) {
      console.error('Error detecting system info:', error);
    }
    
    setIsScanning(false);
    setScanComplete(true);
  };

  const submitSystemData = async (systemInfo: SystemInfo) => {
    try {
      const { error } = await supabase
        .from('system_scans')
        .insert({
          session_id: sessionId,
          manufacturer: systemInfo.manufacturer,
          model: systemInfo.model,
          serial_number: systemInfo.serialNumber,
          processor: systemInfo.processor,
          ram_gb: systemInfo.ram,
          storage_gb: systemInfo.storage,
          tmp_version: systemInfo.tmpVersion,
          secure_boot_capable: systemInfo.secureBootCapable,
          uefi_capable: systemInfo.uefiCapable,
          directx_version: systemInfo.directxVersion,
          display_resolution: systemInfo.displayResolution,
          internet_connection: systemInfo.internetConnection,
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Check compatibility and call callback
      const compatibilityResult = checkCompatibility(systemInfo);
      onScanComplete(compatibilityResult, systemInfo);
      
    } catch (error) {
      console.error('Error submitting system data:', error);
    }
  };

  const checkCompatibility = (systemInfo: SystemInfo): CompatibilityResult => {
    const requirements = {
      processor: {
        met: true, // Assume modern browser = modern processor
        requirement: '1 GHz or faster with 2+ cores on compatible 64-bit processor',
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

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          Browser System Scanner
        </CardTitle>
        <CardDescription className="text-gray-700">
          Quick system detection using your browser
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isScanning && !scanComplete ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                <Computer className="h-5 w-5" />
                Browser-Based Detection
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <div>
                    <p className="font-medium">No downloads required</p>
                    <p className="text-gray-600">Uses your browser's built-in system detection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <div>
                    <p className="font-medium">Instant results</p>
                    <p className="text-gray-600">Get compatibility assessment in seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs">!</Badge>
                  <div>
                    <p className="font-medium">Limited hardware detection</p>
                    <p className="text-gray-600">Some technical details may be estimated</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button 
                onClick={detectSystemInfo}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Computer className="h-5 w-5 mr-2" />
                Scan My System
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Session ID: {sessionId}
              </p>
            </div>
          </div>
        ) : isScanning ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Scanning your system...</h3>
              <p className="text-gray-600">Detecting hardware and compatibility</p>
            </div>
            {Object.keys(detectedInfo).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Detected Information:</h4>
                <div className="text-sm text-left space-y-1">
                  {detectedInfo.manufacturer && <p>Manufacturer: {detectedInfo.manufacturer}</p>}
                  {detectedInfo.model && <p>Model: {detectedInfo.model}</p>}
                  {detectedInfo.processor && <p>Processor: {detectedInfo.processor}</p>}
                  {detectedInfo.ram && <p>RAM: {detectedInfo.ram} GB</p>}
                  {detectedInfo.displayResolution && <p>Display: {detectedInfo.displayResolution}</p>}
                </div>
              </div>
            )}
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

export default BrowserSystemScanner;
