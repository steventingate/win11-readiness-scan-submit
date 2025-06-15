
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Cpu, HardDrive, MemoryStick, Shield, Wifi, CheckCircle, XCircle } from "lucide-react";
import { CompatibilityResult } from "@/pages/Index";

const getRequirementIcon = (requirement: string) => {
  switch (requirement) {
    case "processor":
      return <Cpu className="h-5 w-5 text-blue-500" />;
    case "ram":
      return <MemoryStick className="h-5 w-5 text-green-500" />;
    case "storage":
      return <HardDrive className="h-5 w-5 text-purple-500" />;
    case "tpm":
    case "secureBoot":
    case "uefi":
      return <Shield className="h-5 w-5 text-red-500" />;
    case "internet":
      return <Wifi className="h-5 w-5 text-blue-500" />;
    default:
      return <Monitor className="h-5 w-5 text-gray-500" />;
  }
};

export default function RequirementsAnalysisCard({ compatibilityResult }: { compatibilityResult: CompatibilityResult }) {
  if (!compatibilityResult) return null;
  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Monitor className="h-5 w-5" />
          System Requirements Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {Object.entries(compatibilityResult.requirements).map(([key, req]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                {getRequirementIcon(key)}
                <div>
                  <div className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
                  <div className="text-sm text-gray-600">{req.requirement}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{req.current}</div>
                </div>
                <Badge variant={req.met ? "default" : "destructive"} className="ml-2">
                  {req.met ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  {req.met ? "Met" : "Not Met"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
