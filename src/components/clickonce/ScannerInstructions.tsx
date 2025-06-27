
import { Badge } from '@/components/ui/badge';
import { Computer } from 'lucide-react';

const ScannerInstructions = () => (
  <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-4">
    <h3 className="font-semibold text-green-800 flex items-center gap-2">
      <Computer className="h-5 w-5" />
      ClickOnce System Scanner
    </h3>
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs">1</Badge>
        <div>
          <p className="font-medium">Launch the ClickOnce application</p>
          <p className="text-gray-600">Click the button below to launch the scanner application</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs">2</Badge>
        <div>
          <p className="font-medium">Allow installation if prompted</p>
          <p className="text-gray-600">Windows may ask for permission to install the application</p>
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
        <strong>Accurate Results:</strong> This method provides the most accurate system information by running natively on your computer.
      </p>
    </div>
  </div>
);

export default ScannerInstructions;
