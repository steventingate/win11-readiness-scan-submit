
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Computer, Globe, Edit, Zap } from 'lucide-react';
import BrowserSystemScanner from './BrowserSystemScanner';
import ClickOnceScanner from './ClickOnceScanner';
import ManualSystemInput from './ManualSystemInput';
import PowerShellScanner from './PowerShellScanner';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';

interface ScannerSelectorProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

const ScannerSelector = ({ onScanComplete }: ScannerSelectorProps) => {
  const [selectedScanner, setSelectedScanner] = useState<string | null>(null);

  if (selectedScanner === 'clickonce') {
    return <ClickOnceScanner onScanComplete={onScanComplete} />;
  }

  if (selectedScanner === 'browser') {
    return <BrowserSystemScanner onScanComplete={onScanComplete} />;
  }

  if (selectedScanner === 'manual') {
    return <ManualSystemInput onScanComplete={onScanComplete} />;
  }

  if (selectedScanner === 'powershell') {
    return <PowerShellScanner onScanComplete={onScanComplete} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Choose Your Scanning Method
        </h3>
        <p className="text-orange-100">
          Select the option that works best for your environment
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ClickOnce Scanner - Recommended */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-green-300 relative">
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-green-600 text-white">Recommended</Badge>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-700">
              <Zap className="h-6 w-6" />
              Professional Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">Most Accurate</Badge>
                <Badge variant="secondary" className="text-xs">Easy Install</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Professional ClickOnce application that provides comprehensive system analysis with full hardware access.
              </p>
            </div>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>✅ Complete hardware detection</li>
              <li>✅ Accurate TPM and UEFI detection</li>
              <li>✅ Professional-grade scanning</li>
              <li>✅ One-click installation</li>
            </ul>
            <Button 
              onClick={() => setSelectedScanner('clickonce')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Use Professional Scanner
            </Button>
          </CardContent>
        </Card>

        {/* Browser Scanner */}
        <Card className="bg-white/95 backdrop-blur-sm border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <Globe className="h-6 w-6" />
              Browser Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">No Download</Badge>
                <Badge variant="outline" className="text-xs">Quick</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Browser-based scanning using web APIs. Limited by browser security but requires no downloads.
              </p>
            </div>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>⚠️ Limited hardware detection</li>
              <li>✅ No installation required</li>
              <li>✅ Works on any device</li>
              <li>⚠️ Basic information only</li>
            </ul>
            <Button 
              onClick={() => setSelectedScanner('browser')}
              variant="outline"
              className="w-full"
            >
              <Globe className="h-4 w-4 mr-2" />
              Use Browser Scanner
            </Button>
          </CardContent>
        </Card>

        {/* Manual Input */}
        <Card className="bg-white/95 backdrop-blur-sm border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <Edit className="h-6 w-6" />
              Manual Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">Full Control</Badge>
                <Badge variant="outline" className="text-xs">No Scanning</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Manually enter your system specifications if you already know them or prefer not to use automated scanning.
              </p>
            </div>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>✅ Complete control over input</li>
              <li>✅ No downloads or permissions</li>
              <li>⚠️ Requires technical knowledge</li>
              <li>⚠️ Manual data entry</li>
            </ul>
            <Button 
              onClick={() => setSelectedScanner('manual')}
              variant="outline"
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Enter Manually
            </Button>
          </CardContent>
        </Card>

        {/* PowerShell Scanner */}
        <Card className="bg-white/95 backdrop-blur-sm border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <Computer className="h-6 w-6" />
              PowerShell Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">Advanced</Badge>
                <Badge variant="outline" className="text-xs">Debug</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Advanced PowerShell-based scanner for IT professionals. Provides detailed logs for troubleshooting.
              </p>
            </div>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>🔧 For IT professionals</li>
              <li>✅ Detailed error logging</li>
              <li>⚠️ Requires script execution</li>
              <li>🔧 Advanced troubleshooting</li>
            </ul>
            <Button 
              onClick={() => setSelectedScanner('powershell')}
              variant="outline"
              className="w-full"
            >
              <Computer className="h-4 w-4 mr-2" />
              PowerShell Scanner
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-orange-100">
          Need help choosing? The <strong>Professional Scanner</strong> provides the most accurate results with easy installation.
        </p>
      </div>
    </div>
  );
};

export default ScannerSelector;
