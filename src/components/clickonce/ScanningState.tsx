
import { RefreshCw, CheckCircle } from 'lucide-react';

interface ScanningStateProps {
  sessionId: string;
}

const ScanningState = ({ sessionId }: ScanningStateProps) => (
  <div className="text-center space-y-4">
    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
    <div>
      <h3 className="font-semibold text-lg">Scanning your system...</h3>
      <p className="text-gray-600">Session ID: {sessionId}</p>
      <p className="text-sm text-gray-500 mt-2">The application is gathering detailed system information</p>
    </div>
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <p className="text-sm text-green-800">
          ClickOnce application provides the most accurate system information available.
        </p>
      </div>
    </div>
  </div>
);

export default ScanningState;
