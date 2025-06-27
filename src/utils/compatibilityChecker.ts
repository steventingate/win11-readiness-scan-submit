
import { SystemInfo, CompatibilityResult } from '@/types/clickonce';

export const checkCompatibility = (systemInfo: SystemInfo): CompatibilityResult => {
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
