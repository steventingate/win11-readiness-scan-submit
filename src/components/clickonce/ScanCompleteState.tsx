
import { CheckCircle } from 'lucide-react';

const ScanCompleteState = () => (
  <div className="text-center">
    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
    <h3 className="font-semibold text-lg text-green-600">Scan Complete!</h3>
    <p className="text-gray-600">Processing your comprehensive system information...</p>
  </div>
);

export default ScanCompleteState;
