
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Computer } from "lucide-react";
import { SystemInfo } from "@/pages/Index";

export default function DeviceInfoCard({ systemInfo }: { systemInfo: SystemInfo }) {
  if (!systemInfo) return null;
  return (
    <Card className="border-2 bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Computer className="h-5 w-5" />
          Device Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Manufacturer:</span>
              <span className="ml-2 text-gray-900">{systemInfo.manufacturer}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Model:</span>
              <span className="ml-2 text-gray-900">{systemInfo.model}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Serial Number:</span>
              <span className="ml-2 font-mono text-gray-900">{systemInfo.serialNumber}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Warranty Status:</span>
              <Badge 
                variant={systemInfo.warrantyStatus === "In Warranty"
                  ? "default"
                  : systemInfo.warrantyStatus === "Extended Warranty"
                  ? "secondary"
                  : "destructive"}
              >
                {systemInfo.warrantyStatus}
              </Badge>
            </div>
            {systemInfo.warrantyExpiry && (
              <div>
                <span className="font-medium text-gray-700">Warranty Expires:</span>
                <span className="ml-2 text-gray-900">{systemInfo.warrantyExpiry}</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">System information is simulated for privacy & browser security.</p>
      </CardContent>
    </Card>
  );
}
