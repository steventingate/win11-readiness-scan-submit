
export interface ClickOnceScannerProps {
  onScanComplete: (result: CompatibilityResult, systemInfo: SystemInfo) => void;
}

export interface SystemInfo {
  manufacturer: string;
  model: string;
  serialNumber: string;
  warrantyStatus: string;
  processor: string;
  ram: number;
  storage: number;
  tmpVersion: string;
  secureBootCapable: boolean;
  uefiCapable: boolean;
  directxVersion: string;
  displayResolution: string;
  internetConnection: boolean;
}

export interface CompatibilityRequirement {
  met: boolean;
  requirement: string;
  current: string;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  requirements: {
    processor: CompatibilityRequirement;
    ram: CompatibilityRequirement;
    storage: CompatibilityRequirement;
    tmp: CompatibilityRequirement;
    secureBoot: CompatibilityRequirement;
    uefi: CompatibilityRequirement;
    directx: CompatibilityRequirement;
    display: CompatibilityRequirement;
    internet: CompatibilityRequirement;
  };
}
