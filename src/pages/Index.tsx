
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Cpu, HardDrive, MemoryStick, Shield, Wifi, CheckCircle, XCircle, Loader2 } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);

  const handleScanComplete = (result: CompatibilityResult) => {
    setCompatibilityResult(result);
    setScanComplete(true);
  };

  const handleProceedToForm = () => {
    setShowForm(true);
  };

  const resetScanner = () => {
    setScanComplete(false);
    setCompatibilityResult(null);
    setShowForm(false);
  };

  if (showForm && compatibilityResult) {
    return (
      <UserForm 
        isCompatible={compatibilityResult.isCompatible}
        onBack={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Windows 11 Compatibility Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Check if your current device meets Windows 11 system requirements and get personalized recommendations
          </p>
        </div>

        {!scanComplete ? (
          <SystemScanner onScanComplete={handleScanComplete} />
        ) : (
          <div className="space-y-6">
            {/* Results Overview */}
            <Card className="border-2">
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
                    <span className="text-green-600">Compatible with Windows 11!</span>
                  ) : (
                    <span className="text-red-600">Not Compatible with Windows 11</span>
                  )}
                </CardTitle>
                <CardDescription className="text-lg">
                  {compatibilityResult?.isCompatible 
                    ? "Your device meets all the minimum requirements for Windows 11."
                    : "Your device doesn't meet some requirements. We can help you find a new device."
                  }
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Detailed Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Requirements Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {compatibilityResult && Object.entries(compatibilityResult.requirements).map(([key, req]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                {compatibilityResult?.isCompatible 
                  ? "Request Windows 11 Upgrade" 
                  : "Request New Device Quote"
                }
              </Button>
              <Button 
                onClick={resetScanner}
                variant="outline"
                size="lg"
              >
                Scan Another Device
              </Button>
            </div>
          </div>
        )}
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
