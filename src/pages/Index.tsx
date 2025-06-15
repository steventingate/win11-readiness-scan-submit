
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserForm from '@/components/UserForm';
import DeviceInfoCard from "@/components/DeviceInfoCard";
import ResultOverviewCard from "@/components/ResultOverviewCard";
import RequirementsAnalysisCard from "@/components/RequirementsAnalysisCard";
import ScannerSelector from '@/components/ScannerSelector';

export interface SystemInfo {
  processor: string;
  ram: number;
  storage: number;
  tmpVersion: string;
  secureBootCapable: boolean;
  uefiCapable: boolean;
  directxVersion: string;
  displayResolution: string;
  internetConnection: boolean;
  serialNumber: string;
  model: string;
  manufacturer: string;
  warrantyStatus: 'In Warranty' | 'Out of Warranty' | 'Unknown' | 'Extended Warranty';
  warrantyExpiry?: string;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  requirements: {
    processor: { met: boolean; requirement: string; current: string };
    ram: { met: boolean; requirement: string; current: string };
    storage: { met: boolean; requirement: string; current: string };
    tmp: { met: boolean; requirement: string; current: string };
    secureBoot: { met: boolean; requirement: string; current: string };
    uefi: { met: boolean; requirement: string; current: string };
    directx: { met: boolean; requirement: string; current: string };
    display: { met: boolean; requirement: string; current: string };
    internet: { met: boolean; requirement: string; current: string };
  };
}

const Index = () => {
  const [scanComplete, setScanComplete] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleScanComplete = (result: CompatibilityResult, info: SystemInfo) => {
    setCompatibilityResult(result);
    setSystemInfo(info);
    setScanComplete(true);
  };

  const handleProceedToForm = () => {
    setShowForm(true);
  };

  const resetScanner = () => {
    setScanComplete(false);
    setCompatibilityResult(null);
    setSystemInfo(null);
    setShowForm(false);
  };

  if (showForm && compatibilityResult && systemInfo) {
    return (
      <UserForm 
        isCompatible={compatibilityResult.isCompatible}
        systemInfo={systemInfo}
        onBack={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-orange-600">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=facearea&w=80&h=80&facepad=2"
                alt="Helpdesk Computers Logo"
                className="h-10 w-10 rounded bg-orange-800 object-cover shadow-md"
                style={{ minWidth: 40, minHeight: 40 }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Helpdesk Computers</h1>
                <p className="text-sm text-gray-600">Windows 11 Compatibility Assessment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Professional IT Solutions</p>
              <p className="text-xs text-primary">helpdeskcomputers.com.au</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Windows 11 Compatibility Checker
          </h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Multiple scanning options to assess your system's Windows 11 compatibility
          </p>
        </div>

        {!scanComplete ? (
          <ScannerSelector onScanComplete={handleScanComplete} />
        ) : (
          <div className="space-y-6">
            {systemInfo && <DeviceInfoCard systemInfo={systemInfo} />}
            <ResultOverviewCard isCompatible={compatibilityResult?.isCompatible} />
            {compatibilityResult && <RequirementsAnalysisCard compatibilityResult={compatibilityResult} />}
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleProceedToForm}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {compatibilityResult?.isCompatible 
                  ? "Request Windows 11 Upgrade Service" 
                  : "Request Hardware Upgrade Quote"
                }
              </Button>
              <Button 
                onClick={resetScanner}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Scan Another Device
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 bg-orange-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-orange-100 text-sm">
            © 2024 Helpdesk Computers - Professional IT Solutions & Support
          </p>
          <p className="text-orange-200 text-xs mt-2">
            Visit us at <span className="font-medium">helpdeskcomputers.com.au</span> for comprehensive IT services
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
