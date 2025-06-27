
import { Badge } from '@/components/ui/badge';
import { Computer } from 'lucide-react';

const ScannerInstructions = () => (
  <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-4">
    <h3 className="font-semibold text-green-800 flex items-center gap-2">
      <Computer className="h-5 w-5" />
      Standalone System Scanner
    </h3>
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs">1</Badge>
        <div>
          <p className="font-medium">Download the scanner application</p>
          <p className="text-gray-600">Click the button below to download the Win11Scanner.exe file</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs">2</Badge>
        <div>
          <p className="font-medium">Run the downloaded executable</p>
          <p className="text-gray-600">Double-click the downloaded .exe file to launch the scanner</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs">3</Badge>
        <div>
          <p className="font-medium">Wait for automatic scanning</p>
          <p className="text-gray-600">The application will scan your system and send results automatically</p>
        </div>
      </div>
    </div>
    <div className="bg-blue-100 p-3 rounded border border-blue-200">
      <p className="text-blue-800 text-sm">
        <strong>Reliable Results:</strong> This standalone executable provides comprehensive system scanning without installation requirements.
      </p>
    </div>
  </div>
);

export default ScannerInstructions;
