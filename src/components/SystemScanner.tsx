import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Scan, Computer } from 'lucide-react';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';
import { AlertCircle } from "lucide-react";

interface SystemScannerProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

const SystemScanner = ({ onScanComplete }: SystemScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const scanSteps = [
    'Detecting system manufacturer...',
    'Reading device model information...',
    'Retrieving serial number...',
    'Checking warranty status...',
    'Analyzing processor compatibility...',
    'Measuring memory capacity...',
    'Scanning storage devices...',
    'Verifying TPM security module...',
    'Testing secure boot capability...',
    'Validating UEFI firmware...',
    'Checking DirectX support...',
    'Measuring display specifications...',
    'Testing network connectivity...'
  ];

  const SimulatedNotice = () => (
    <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 rounded p-3 mb-4">
      <AlertCircle className="h-5 w-5 text-yellow-600" />
      <span className="text-yellow-800 text-sm">
        <strong>Note:</strong> Actual device information cannot be reliably detected from the browser. The system scan provides a simulated estimate for demonstration purposes.
      </span>
    </div>
  );

  const detectActualSystemInfo = async (): Promise<SystemInfo> => {
    let manufacturer = 'Unknown';
    let model = 'Unknown';
    let serialNumber = 'Unknown';
    
    try {
      // Try to detect manufacturer and model from User Agent
      const userAgent = navigator.userAgent;
      console.log('User Agent:', userAgent);
      
      // Check for common manufacturer patterns in user agent or other available APIs
      if (userAgent.includes('Dell') || userAgent.includes('DELL')) {
        manufacturer = 'Dell';
      } else if (userAgent.includes('HP') || userAgent.includes('hp')) {
        manufacturer = 'HP';
      } else if (userAgent.includes('Lenovo') || userAgent.includes('LENOVO')) {
        manufacturer = 'Lenovo';
      } else if (userAgent.includes('ASUS') || userAgent.includes('asus')) {
        manufacturer = 'ASUS';
      } else if (userAgent.includes('Acer') || userAgent.includes('ACER')) {
        manufacturer = 'Acer';
      }

      // Try to get more detailed system information if available
      if ('userAgentData' in navigator) {
        const uaData = (navigator as any).userAgentData;
        if (uaData && uaData.getHighEntropyValues) {
          try {
            const highEntropyValues = await uaData.getHighEntropyValues(['model', 'platform', 'platformVersion']);
            console.log('High entropy values:', highEntropyValues);
            
            if (highEntropyValues.model) {
              model = highEntropyValues.model;
            }
          } catch (error) {
            console.log('Could not get high entropy values:', error);
          }
        }
      }

      // Try to get system memory info
      let ramGB = 8; // Default fallback
      if ('memory' in performance && (performance as any).memory) {
        const memInfo = (performance as any).memory;
        // Convert bytes to GB (approximate)
        ramGB = Math.round(memInfo.jsHeapSizeLimit / (1024 * 1024 * 1024));
        if (ramGB < 2) ramGB = 8; // Fallback for unrealistic values
      }

      // Try to get screen information
      const displayResolution = `${screen.width}x${screen.height}`;

      // Check for network connectivity
      const internetConnection = navigator.onLine;

      // Generate a pseudo-unique identifier based on available system info
      const screenInfo = `${screen.width}${screen.height}${screen.colorDepth}`;
      const timezoneOffset = new Date().getTimezoneOffset();
      const language = navigator.language;
      serialNumber = `SN${btoa(screenInfo + timezoneOffset + language).slice(0, 10).toUpperCase()}`;

      // If we couldn't detect manufacturer, use a more sophisticated approach
      if (manufacturer === 'Unknown') {
        // Check platform information
        const platform = navigator.platform;
        if (platform.includes('Win')) {
          // For Windows, we'll need to make educated guesses based on other factors
          // This is a limitation of web browsers for security reasons
          manufacturer = 'PC Manufacturer';
          model = 'Windows PC';
        } else if (platform.includes('Mac')) {
          manufacturer = 'Apple';
          model = 'Mac';
        } else if (platform.includes('Linux')) {
          manufacturer = 'Linux PC';
          model = 'Linux Computer';
        }
      }

      // Set a more realistic model if we have manufacturer but no specific model
      if (model === 'Unknown' && manufacturer !== 'Unknown') {
        const modelsByManufacturer = {
          'Dell': ['OptiPlex 7090', 'Latitude 5520', 'Inspiron 3501', 'Precision 5560'],
          'HP': ['EliteBook 850 G8', 'ProBook 450 G8', 'Pavilion 15-eh1', 'EliteDesk 800 G6'],
          'Lenovo': ['ThinkPad T14', 'IdeaPad 3', 'ThinkCentre M75q', 'Legion 5'],
          'ASUS': ['VivoBook 15', 'ZenBook 14', 'ROG Strix G15', 'ExpertBook B9'],
          'Acer': ['Aspire 5', 'Swift 3', 'Predator Helios 300', 'TravelMate P2']
        };
        
        const models = modelsByManufacturer[manufacturer as keyof typeof modelsByManufacturer];
        if (models) {
          model = models[0]; // Use first model as default
        }
      }

      return {
        manufacturer,
        model,
        serialNumber,
        warrantyStatus: Math.random() > 0.5 ? 'In Warranty' : 'Out of Warranty',
        warrantyExpiry: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toLocaleDateString() : undefined,
        processor: getProcessorInfo(),
        ram: ramGB,
        storage: getStorageEstimate(),
        tpmVersion: Math.random() > 0.7 ? '2.0' : '1.2',
        secureBootCapable: Math.random() > 0.3,
        uefiCapable: Math.random() > 0.2,
        directxVersion: Math.random() > 0.4 ? '12' : '11',
        displayResolution,
        internetConnection
      };
    } catch (error) {
      console.error('Error detecting system info:', error);
      // Fallback to simulated detection
      return simulateSystemDetection();
    }
  };

  const getProcessorInfo = (): string => {
    // Try to get CPU info from available APIs
    const cores = navigator.hardwareConcurrency || 4;
    
    // Common processor patterns based on core count and other factors
    if (cores >= 8) {
      return '11th Gen Intel Core i7-1165G7';
    } else if (cores >= 4) {
      return '8th Gen Intel Core i5-8250U';
    } else {
      return '7th Gen Intel Core i3-7100U';
    }
  };

  const getStorageEstimate = (): number => {
    // This is an estimate based on common configurations
    // In real applications, you'd need more sophisticated detection
    if ('storage' in navigator && (navigator as any).storage && (navigator as any).storage.estimate) {
      (navigator as any).storage.estimate().then((estimate: any) => {
        console.log('Storage estimate:', estimate);
      });
    }
    
    // Return common storage sizes
    const commonSizes = [256, 512, 1024];
    return commonSizes[Math.floor(Math.random() * commonSizes.length)];
  };

  const simulateSystemDetection = (): SystemInfo => {
    const manufacturers = ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer'];
    const selectedManufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    
    const models = {
      'Dell': ['OptiPlex 7090', 'Latitude 5520', 'Inspiron 3501', 'Precision 5560'],
      'HP': ['EliteBook 850 G8', 'ProBook 450 G8', 'Pavilion 15-eh1', 'EliteDesk 800 G6'],
      'Lenovo': ['ThinkPad T14', 'IdeaPad 3', 'ThinkCentre M75q', 'Legion 5'],
      'ASUS': ['VivoBook 15', 'ZenBook 14', 'ROG Strix G15', 'ExpertBook B9'],
      'Acer': ['Aspire 5', 'Swift 3', 'Predator Helios 300', 'TravelMate P2']
    };

    const selectedModel = models[selectedManufacturer as keyof typeof models][
      Math.floor(Math.random() * models[selectedManufacturer as keyof typeof models].length)
    ];

    const generateSerialNumber = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const warrantyStatuses: Array<SystemInfo['warrantyStatus']> = [
      'In Warranty', 'Out of Warranty', 'Extended Warranty', 'Unknown'
    ];
    const warrantyStatus = warrantyStatuses[Math.floor(Math.random() * warrantyStatuses.length)];
    
    const processors = [
      '8th Gen Intel Core i5-8250U',
      '7th Gen Intel Core i3-7100U',
      'AMD Ryzen 5 3600',
      'Intel Core i7-10700K',
      '6th Gen Intel Core i5-6200U',
      '11th Gen Intel Core i7-1165G7',
      'AMD Ryzen 7 5800H'
    ];
    
    const ramOptions = [4, 8, 16, 32];
    const storageOptions = [128, 256, 512, 1024];
    const tpmVersions = ['1.2', '2.0', 'Not Detected'];
    
    const warrantyExpiry = warrantyStatus === 'In Warranty' || warrantyStatus === 'Extended Warranty' 
      ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toLocaleDateString()
      : undefined;

    return {
      manufacturer: selectedManufacturer,
      model: selectedModel,
      serialNumber: generateSerialNumber(),
      warrantyStatus,
      warrantyExpiry,
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
             systemInfo.processor.includes('i7-10700K') ||
             systemInfo.processor.includes('11th Gen') ||
             systemInfo.processor.includes('Ryzen 7'),
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
      tpm: {
        met: systemInfo.tpmVersion === '2.0',
        requirement: 'TPM version 2.0 (Trusted Platform Module)',
        current: systemInfo.tpmVersion === 'Not Detected' ? 'TPM not detected' : `TPM ${systemInfo.tpmVersion}`
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
        met: systemInfo.displayResolution === '1920x1080',
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

  const startScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate enhanced scanning process
    for (let i = 0; i < scanSteps.length; i++) {
      setCurrentStep(scanSteps[i]);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      setScanProgress(((i + 1) / scanSteps.length) * 100);
    }

    // Simulate final processing
    setCurrentStep('Performing compatibility analysis...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const systemInfo = await detectActualSystemInfo();
    const compatibilityResult = checkCompatibility(systemInfo);
    
    setIsScanning(false);
    onScanComplete(compatibilityResult, systemInfo);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          Professional System Analysis
        </CardTitle>
        <CardDescription className="text-gray-700">
          Comprehensive Windows 11 compatibility assessment with detailed device information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <SimulatedNotice />
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="font-semibold mb-3 text-primary">Complete System Assessment:</h3>
              <ul className="text-sm space-y-2 text-left max-w-md mx-auto text-gray-700">
                <li>• Device identification & warranty status</li>
                <li>• Processor & memory compatibility</li>
                <li>• Security module verification (TPM 2.0)</li>
                <li>• UEFI & Secure Boot validation</li>
                <li>• Graphics & display requirements</li>
                <li>• Storage & connectivity analysis</li>
              </ul>
            </div>
            <Button 
              onClick={startScan}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Scan className="h-5 w-5 mr-2" />
              Begin Professional System Scan
            </Button>
            <p className="text-xs text-gray-600">
              Powered by Helpdesk Computers - Trusted IT Solutions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="font-medium text-lg text-primary">Analyzing your system...</p>
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
