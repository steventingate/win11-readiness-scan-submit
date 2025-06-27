
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

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
      <ExternalLink className="h-5 w-5 mr-2" />
      Launch System Scanner
    </Button>
    <p className="text-xs text-gray-600">
      Session ID: {sessionId}
    </p>
    <div className="text-center">
      <p className="text-xs text-gray-500">
        Alternative download: 
        <a 
          href="https://gearedit.com.au/win11/public/clickonce/win-x64/Win11Scanner.exe" 
          download
          className="text-primary hover:underline ml-1"
        >
          Standalone executable
        </a>
      </p>
    </div>
  </div>
);

export default ScannerLauncher;
