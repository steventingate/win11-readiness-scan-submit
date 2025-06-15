
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Keyboard, CheckCircle } from 'lucide-react';
import { SystemInfo, CompatibilityResult } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';

interface ManualSystemInputProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

const ManualSystemInput = ({ onScanComplete }: ManualSystemInputProps) => {
  const [sessionId] = useState(() => `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    processor: '',
    ram: '',
    storage: '',
    tmpVersion: '',
    secureBootCapable: '',
    uefiCapable: '',
    directxVersion: '12'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const systemInfo: SystemInfo = {
        manufacturer: formData.manufacturer || 'Unknown',
        model: formData.model || 'Unknown',
        serialNumber: 'Manual-Entry',
        warrantyStatus: 'Unknown',
        processor: formData.processor || 'Unknown Processor',
        ram: parseInt(formData.ram) || 4,
        storage: parseInt(formData.storage) || 256,
        tmpVersion: formData.tmpVersion || '2.0',
        secureBootCapable: formData.secureBootCapable === 'true',
        uefiCapable: formData.uefiCapable === 'true',
        directxVersion: formData.directxVersion,
        displayResolution: `${screen.width}x${screen.height}`,
        internetConnection: navigator.onLine
      };

      // Submit to database
      const { error } = await supabase
        .from('system_scans')
        .insert({
          session_id: sessionId,
          manufacturer: systemInfo.manufacturer,
          model: systemInfo.model,
          serial_number: systemInfo.serialNumber,
          processor: systemInfo.processor,
          ram_gb: systemInfo.ram,
          storage_gb: systemInfo.storage,
          tmp_version: systemInfo.tmpVersion,
          secure_boot_capable: systemInfo.secureBootCapable,
          uefi_capable: systemInfo.uefiCapable,
          directx_version: systemInfo.directxVersion,
          display_resolution: systemInfo.displayResolution,
          internet_connection: systemInfo.internetConnection,
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Check compatibility and call callback
      const compatibilityResult = checkCompatibility(systemInfo);
      onScanComplete(compatibilityResult, systemInfo);
      
    } catch (error) {
      console.error('Error submitting manual data:', error);
    }
    
    setIsSubmitting(false);
  };

  const checkCompatibility = (systemInfo: SystemInfo): CompatibilityResult => {
    const requirements = {
      processor: {
        met: systemInfo.processor.includes('i7-') || 
             systemInfo.processor.includes('i5-') || 
             systemInfo.processor.includes('Ryzen') ||
             systemInfo.processor.includes('8th Gen') ||
             systemInfo.processor.includes('11th Gen'),
        requirement: '1 GHz or faster with 2+ cores on compatible 64-bit processor (8th gen Intel or AMD Ryzen 2000+)',
        current: systemInfo.processor
      },
      ram: {
        met: systemInfo.ram >= 4,
        requirement: '4 GB RAM minimum (8 GB recommended)',
        current: `${systemInfo.ram} GB`
      },
      storage: {
        met: systemInfo.storage >= 64,
        requirement: '64 GB available storage minimum',
        current: `${systemInfo.storage} GB`
      },
      tmp: {
        met: systemInfo.tmpVersion === '2.0',
        requirement: 'TPM version 2.0 (Trusted Platform Module)',
        current: systemInfo.tmpVersion === 'Not Detected' ? 'TPM not detected' : `TPM ${systemInfo.tmpVersion}`
      },
      secureBoot: {
        met: systemInfo.secureBootCapable,
        requirement: 'Secure Boot capable firmware',
        current: systemInfo.secureBootCapable ? 'Supported' : 'Not supported'
      },
      uefi: {
        met: systemInfo.uefiCapable,
        requirement: 'UEFI firmware (Legacy BIOS not supported)',
        current: systemInfo.uefiCapable ? 'UEFI supported' : 'Legacy BIOS detected'
      },
      directx: {
        met: systemInfo.directxVersion === '12',
        requirement: 'DirectX 12 or later with WDDM 2.0 driver',
        current: `DirectX ${systemInfo.directxVersion}`
      },
      display: {
        met: parseInt(systemInfo.displayResolution.split('x')[1]) >= 720,
        requirement: 'High definition (720p) display, 9" diagonal or greater',
        current: systemInfo.displayResolution
      },
      internet: {
        met: systemInfo.internetConnection,
        requirement: 'Internet connectivity for updates and activation',
        current: systemInfo.internetConnection ? 'Connected' : 'Not connected'
      }
    };

    const isCompatible = Object.values(requirements).every(req => req.met);

    return {
      isCompatible,
      requirements
    };
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Keyboard className="h-6 w-6" />
          Manual System Input
        </CardTitle>
        <CardDescription className="text-gray-700">
          Enter your system specifications manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="e.g. Dell, HP, ASUS"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="e.g. OptiPlex 7090"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="processor">Processor</Label>
            <Input
              id="processor"
              placeholder="e.g. Intel Core i5-11400, AMD Ryzen 5 3600"
              value={formData.processor}
              onChange={(e) => setFormData({...formData, processor: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ram">RAM (GB)</Label>
              <Input
                id="ram"
                type="number"
                placeholder="8"
                value={formData.ram}
                onChange={(e) => setFormData({...formData, ram: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="storage">Storage (GB)</Label>
              <Input
                id="storage"
                type="number"
                placeholder="256"
                value={formData.storage}
                onChange={(e) => setFormData({...formData, storage: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tmpVersion">TPM Version</Label>
              <Select value={formData.tmpVersion} onValueChange={(value) => setFormData({...formData, tmpVersion: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select TPM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2.0">TPM 2.0</SelectItem>
                  <SelectItem value="1.2">TPM 1.2</SelectItem>
                  <SelectItem value="Not Detected">Not Detected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="secureBootCapable">Secure Boot</Label>
              <Select value={formData.secureBootCapable} onValueChange={(value) => setFormData({...formData, secureBootCapable: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Supported</SelectItem>
                  <SelectItem value="false">Not Supported</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="uefiCapable">UEFI</Label>
              <Select value={formData.uefiCapable} onValueChange={(value) => setFormData({...formData, uefiCapable: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">UEFI</SelectItem>
                  <SelectItem value="false">Legacy BIOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Keyboard className="h-5 w-5 mr-2" />
                Analyze System
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Session ID: {sessionId}
        </p>
      </CardContent>
    </Card>
  );
};

export default ManualSystemInput;
