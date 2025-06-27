import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Computer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ClickOnceScannerProps, SystemInfo } from '@/types/clickonce';
import { checkCompatibility } from '@/utils/compatibilityChecker';
import ScannerInstructions from './clickonce/ScannerInstructions';
import ScannerLauncher from './clickonce/ScannerLauncher';
import ScanningState from './clickonce/ScanningState';
import ScanCompleteState from './clickonce/ScanCompleteState';

const ClickOnceScanner = ({ onScanComplete }: ClickOnceScannerProps) => {
  const [sessionId] = useState(() => `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isWaiting, setIsWaiting] = useState(false);
  const [scanReceived, setScanReceived] = useState(false);

  useEffect(() => {
    if (!isWaiting) return;

    console.log('Waiting for standalone scanner data with session ID:', sessionId);

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

  const downloadStandaloneApp = async () => {
    try {
      console.log('Creating custom scanner with session ID:', sessionId);
      
      // Fetch the local exe file from the public directory
      const response = await fetch('/clickonce/win-x64/Win11Scanner.exe');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create a custom filename with session ID
      const customFilename = `Win11Scanner_${sessionId}.exe`;
      
      // Create download link with proper filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = customFilename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('Downloaded custom scanner as:', customFilename);
      setIsWaiting(true);
      
    } catch (error) {
      console.error('Error downloading scanner:', error);
      // Fallback to direct download from local path
      const link = document.createElement('a');
      link.href = '/clickonce/win-x64/Win11Scanner.exe';
      link.download = `Win11Scanner_${sessionId}.exe`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsWaiting(true);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Computer className="h-6 w-6" />
          Standalone System Scanner
        </CardTitle>
        <CardDescription className="text-gray-700">
          Professional-grade system scanning with comprehensive hardware analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isWaiting && !scanReceived ? (
          <div className="space-y-4">
            <ScannerInstructions />
            <ScannerLauncher 
              sessionId={sessionId} 
              onLaunch={downloadStandaloneApp} 
            />
          </div>
        ) : isWaiting ? (
          <ScanningState sessionId={sessionId} />
        ) : (
          <ScanCompleteState />
        )}
      </CardContent>
    </Card>
  );
};

export default ClickOnceScanner;
