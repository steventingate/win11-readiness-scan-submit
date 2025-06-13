
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Cpu, HardDrive, MemoryStick, Shield, Wifi, CheckCircle, XCircle, Loader2, Computer } from 'lucide-react';
import SystemScanner from '@/components/SystemScanner';
import UserForm from '@/components/UserForm';

export interface SystemInfo {
  processor: string;
  ram: number;
  storage: number;
  tpmVersion: string;
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
    tpm: { met: boolean; requirement: string; current: string };
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
              <Computer className="h-8 w-8 text-primary" />
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
            Comprehensive system analysis to determine Windows 11 readiness with detailed device information and warranty status
          </p>
        </div>

        {!scanComplete ? (
          <SystemScanner onScanComplete={handleScanComplete} />
        ) : (
          <div className="space-y-6">
            {/* Device Information Card */}
            {systemInfo && (
              <Card className="border-2 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Computer className="h-5 w-5" />
                    Device Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Manufacturer:</span>
                        <span className="ml-2 text-gray-900">{systemInfo.manufacturer}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Model:</span>
                        <span className="ml-2 text-gray-900">{systemInfo.model}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Serial Number:</span>
                        <span className="ml-2 font-mono text-gray-900">{systemInfo.serialNumber}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Warranty Status:</span>
                        <Badge 
                          variant={systemInfo.warrantyStatus === 'In Warranty' ? 'default' : 
                                  systemInfo.warrantyStatus === 'Extended Warranty' ? 'secondary' : 'destructive'}
                        >
                          {systemInfo.warrantyStatus}
                        </Badge>
                      </div>
                      {systemInfo.warrantyExpiry && (
                        <div>
                          <span className="font-medium text-gray-700">Warranty Expires:</span>
                          <span className="ml-2 text-gray-900">{systemInfo.warrantyExpiry}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Overview */}
            <Card className="border-2 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {compatibilityResult?.isCompatible ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {compatibilityResult?.isCompatible ? (
                    <span className="text-green-600">Windows 11 Compatible!</span>
                  ) : (
                    <span className="text-red-600">Windows 11 Upgrade Required</span>
                  )}
                </CardTitle>
                <CardDescription className="text-lg">
                  {compatibilityResult?.isCompatible 
                    ? "Your device meets all Windows 11 system requirements."
                    : "Your device requires hardware upgrades or replacement for Windows 11."
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Detailed Requirements */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Monitor className="h-5 w-5" />
                  System Requirements Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {compatibilityResult && Object.entries(compatibilityResult.requirements).map(([key, req]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getRequirementIcon(key)}
                        <div>
                          <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          <div className="text-sm text-gray-600">{req.requirement}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{req.current}</div>
                        </div>
                        <Badge variant={req.met ? "default" : "destructive"} className="ml-2">
                          {req.met ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {req.met ? "Met" : "Not Met"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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

const getRequirementIcon = (requirement: string) => {
  switch (requirement) {
    case 'processor':
      return <Cpu className="h-5 w-5 text-blue-500" />;
    case 'ram':
      return <MemoryStick className="h-5 w-5 text-green-500" />;
    case 'storage':
      return <HardDrive className="h-5 w-5 text-purple-500" />;
    case 'tpm':
    case 'secureBoot':
    case 'uefi':
      return <Shield className="h-5 w-5 text-red-500" />;
    case 'internet':
      return <Wifi className="h-5 w-5 text-blue-500" />;
    default:
      return <Monitor className="h-5 w-5 text-gray-500" />;
  }
};

export default Index;
