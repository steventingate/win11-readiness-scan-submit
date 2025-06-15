
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Computer, Download, Keyboard } from 'lucide-react';
import PowerShellScanner from './PowerShellScanner';
import BrowserSystemScanner from './BrowserSystemScanner';
import ManualSystemInput from './ManualSystemInput';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';

interface ScannerSelectorProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

type ScannerType = 'selector' | 'powershell' | 'browser' | 'manual';

const ScannerSelector = ({ onScanComplete }: ScannerSelectorProps) => {
  const [selectedScanner, setSelectedScanner] = useState<ScannerType>('selector');

  if (selectedScanner === 'powershell') {
    return <PowerShellScanner onScanComplete={onScanComplete} />;
  }

  if (selectedScanner === 'browser') {
    return <BrowserSystemScanner onScanComplete={onScanComplete} />;
  }

  if (selectedScanner === 'manual') {
    return <ManualSystemInput onScanComplete={onScanComplete} />;
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          Choose Scanning Method
        </CardTitle>
        <CardDescription className="text-gray-700">
          Select the best method to analyze your system for Windows 11 compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedScanner('browser')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Computer className="h-8 w-8 text-green-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">Browser Scanner (Recommended)</h3>
                  <p className="text-sm text-gray-600">Quick scan using your browser - no downloads required</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Instant</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Safe</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedScanner('manual')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Keyboard className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">Manual Input</h3>
                  <p className="text-sm text-gray-600">Enter your system specifications manually</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Accurate</span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Flexible</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setSelectedScanner('powershell')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-orange-500" />
                <div className="flex-1">
                  <h3 className="font-semibold">PowerShell Scanner (Advanced)</h3>
                  <p className="text-sm text-gray-600">Download and run detailed system scanner</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Detailed</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Requires Admin</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Recommendation</h4>
          <p className="text-sm text-blue-700">
            Start with the <strong>Browser Scanner</strong> for quick results. 
            Use <strong>Manual Input</strong> if you know your exact specifications, or 
            try the <strong>PowerShell Scanner</strong> for the most detailed analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScannerSelector;
