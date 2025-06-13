
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Scan } from 'lucide-react';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';

interface SystemScannerProps {
  onScanComplete: (result: CompatibilityResult) => void;
}

const SystemScanner = ({ onScanComplete }: SystemScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const scanSteps = [
    'Detecting processor...',
    'Checking memory capacity...',
    'Analyzing storage...',
    'Verifying TPM module...',
    'Testing secure boot...',
    'Checking UEFI support...',
    'Validating DirectX...',
    'Measuring display resolution...',
    'Testing internet connection...'
  ];

  const simulateSystemDetection = (): SystemInfo => {
    // Simulate system detection with realistic variations
    const processors = [
      '8th Gen Intel Core i5-8250U',
      '7th Gen Intel Core i3-7100U',
      'AMD Ryzen 5 3600',
      'Intel Core i7-10700K',
      '6th Gen Intel Core i5-6200U'
    ];
    
    const ramOptions = [4, 8, 16, 32];
    const storageOptions = [128, 256, 512, 1024];
    const tpmVersions = ['1.2', '2.0', 'Not Detected'];
    
    return {
      processor: processors[Math.floor(Math.random() * processors.length)],
      ram: ramOptions[Math.floor(Math.random() * ramOptions.length)],
      storage: storageOptions[Math.floor(Math.random() * storageOptions.length)],
      tpmVersion: tpmVersions[Math.floor(Math.random() * tpmVersions.length)],
      secureBootCapable: Math.random() > 0.3,
      uefiCapable: Math.random() > 0.2,
      directxVersion: Math.random() > 0.4 ? '12' : '11',
      displayResolution: Math.random() > 0.5 ? '1920x1080' : '1366x768',
      internetConnection: true
    };
  };

  const checkCompatibility = (systemInfo: SystemInfo): CompatibilityResult => {
    const requirements = {
      processor: {
        met: systemInfo.processor.includes('8th Gen') || 
             systemInfo.processor.includes('Ryzen 5') || 
             systemInfo.processor.includes('i7-10700K'),
        requirement: '1 GHz or faster with 2 or more cores on a compatible 64-bit processor',
        current: systemInfo.processor
      },
      ram: {
        met: systemInfo.ram >= 4,
        requirement: '4 GB RAM minimum',
        current: `${systemInfo.ram} GB`
      },
      storage: {
        met: systemInfo.storage >= 64,
        requirement: '64 GB available storage',
        current: `${systemInfo.storage} GB`
      },
      tpm: {
        met: systemInfo.tpmVersion === '2.0',
        requirement: 'TPM version 2.0',
        current: systemInfo.tpmVersion === 'Not Detected' ? 'TPM not detected' : `TPM ${systemInfo.tpmVersion}`
      },
      secureBoot: {
        met: systemInfo.secureBootCapable,
        requirement: 'Secure Boot capable',
        current: systemInfo.secureBootCapable ? 'Supported' : 'Not supported'
      },
      uefi: {
        met: systemInfo.uefiCapable,
        requirement: 'UEFI firmware',
        current: systemInfo.uefiCapable ? 'UEFI supported' : 'Legacy BIOS'
      },
      directx: {
        met: systemInfo.directxVersion === '12',
        requirement: 'DirectX 12 or later with WDDM 2.0 driver',
        current: `DirectX ${systemInfo.directxVersion}`
      },
      display: {
        met: systemInfo.displayResolution === '1920x1080',
        requirement: 'High definition (720p) display, 9" or greater monitor',
        current: systemInfo.displayResolution
      },
      internet: {
        met: systemInfo.internetConnection,
        requirement: 'Internet connectivity',
        current: systemInfo.internetConnection ? 'Connected' : 'Not connected'
      }
    };

    const isCompatible = Object.values(requirements).every(req => req.met);

    return {
      isCompatible,
      requirements
    };
  };

  const startScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning process
    for (let i = 0; i < scanSteps.length; i++) {
      setCurrentStep(scanSteps[i]);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      setScanProgress(((i + 1) / scanSteps.length) * 100);
    }

    // Simulate final processing
    setCurrentStep('Analyzing compatibility...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const systemInfo = simulateSystemDetection();
    const compatibilityResult = checkCompatibility(systemInfo);
    
    setIsScanning(false);
    onScanComplete(compatibilityResult);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scan className="h-6 w-6" />
          System Compatibility Scanner
        </CardTitle>
        <CardDescription>
          This tool will analyze your current device to check Windows 11 compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">What we'll check:</h3>
              <ul className="text-sm space-y-1 text-left max-w-md mx-auto">
                <li>• Processor compatibility</li>
                <li>• Memory and storage requirements</li>
                <li>• TPM 2.0 security module</li>
                <li>• UEFI and Secure Boot support</li>
                <li>• Graphics and display capabilities</li>
              </ul>
            </div>
            <Button 
              onClick={startScan}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Scan className="h-5 w-5 mr-2" />
              Start System Scan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="font-medium text-lg">Scanning your system...</p>
              <p className="text-sm text-gray-600">{currentStep}</p>
            </div>
            <Progress value={scanProgress} className="w-full" />
            <p className="text-center text-sm text-gray-500">
              {Math.round(scanProgress)}% complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemScanner;
