
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ScannerLauncherProps {
  sessionId: string;
  onLaunch: () => void;
}

const ScannerLauncher = ({ sessionId, onLaunch }: ScannerLauncherProps) => (
  <div className="text-center space-y-4">
    <Button 
      onClick={onLaunch}
      size="lg"
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <Download className="h-5 w-5 mr-2" />
      Download System Scanner
    </Button>
    <p className="text-xs text-gray-600">
      Session ID: {sessionId}
    </p>
    <div className="bg-blue-50 p-4 rounded border border-blue-200">
      <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
      <ol className="text-blue-700 text-sm space-y-1 text-left list-decimal list-inside">
        <li>Click "Download System Scanner" above</li>
        <li>The file will be saved as "Win11Scanner_{sessionId}.exe"</li>
        <li>Run the downloaded file - it will automatically detect the session ID</li>
        <li>Click "Start System Scan" in the scanner window</li>
        <li>Wait for the scan to complete and results will appear here</li>
      </ol>
    </div>
    <div className="bg-amber-50 p-3 rounded border border-amber-200">
      <p className="text-amber-800 text-sm">
        <strong>Important:</strong> The scanner will automatically extract the session ID from the filename. Make sure to run the downloaded file, not the original one in the folder!
      </p>
    </div>
  </div>
);

export default ScannerLauncher;
