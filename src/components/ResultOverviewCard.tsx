
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { CompatibilityResult } from "@/pages/Index";

export default function ResultOverviewCard({ isCompatible }: { isCompatible?: boolean }) {
  return (
    <Card className="border-2 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isCompatible ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {isCompatible ? (
            <span className="text-green-600">Windows 11 Compatible!</span>
          ) : (
            <span className="text-red-600">Windows 11 Upgrade Required</span>
          )}
        </CardTitle>
        <CardDescription className="text-lg">
          {isCompatible
            ? "Your device meets all Windows 11 system requirements."
            : "Your device requires hardware upgrades or replacement for Windows 11."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
