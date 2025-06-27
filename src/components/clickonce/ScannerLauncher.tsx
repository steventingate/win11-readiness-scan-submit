
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
    <div className="bg-amber-50 p-3 rounded border border-amber-200">
      <p className="text-amber-800 text-sm">
        <strong>After downloading:</strong> Run the Win11Scanner.exe file and it will automatically scan your system and send the results back to this page.
      </p>
    </div>
  </div>
);

export default ScannerLauncher;
