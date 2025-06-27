
using System;
using System.Management;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

namespace Win11Scanner
{
    public class SystemInfoScanner
    {
        public event Action<string> StatusChanged;
        public event Action<int> ProgressChanged;
        public event Action<string> LogMessage;

        public async Task<SystemInfo> ScanSystemAsync(string sessionId)
        {
            var systemInfo = new SystemInfo { SessionId = sessionId };
            
            await Task.Run(() =>
            {
                try
                {
                    ScanProcessor(systemInfo);
                    ScanMemory(systemInfo);
                    ScanStorage(systemInfo);
                    ScanSystemInfo(systemInfo);
                    ScanBIOS(systemInfo);
                    ScanUEFI(systemInfo);
                    ScanTPM(systemInfo);
                    ScanSecureBoot(systemInfo);
                    ScanDirectX(systemInfo);
                    ScanDisplay(systemInfo);
                    ScanInternetConnection(systemInfo);
                }
                catch (Exception ex)
                {
                    LogMessage?.Invoke($"Scan error: {ex.Message}");
                }
            });

            return systemInfo;
        }

        private void ScanProcessor(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Scanning processor information...");
            ProgressChanged?.Invoke(10);
            LogMessage?.Invoke("Analyzing CPU specifications...");
            
            using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor"))
            {
                foreach (ManagementObject obj in searcher.Get())
                {
                    systemInfo.Processor = obj["Name"]?.ToString() ?? "Unknown";
                    break;
                }
            }
        }

        private void ScanMemory(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Scanning memory configuration...");
            ProgressChanged?.Invoke(20);
            LogMessage?.Invoke("Checking RAM specifications...");
            
            using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory"))
            {
                long totalMemory = 0;
                foreach (ManagementObject obj in searcher.Get())
                {
                    totalMemory += Convert.ToInt64(obj["Capacity"]);
                }
                systemInfo.RamGb = (int)(totalMemory / (1024 * 1024 * 1024));
            }
        }

        private void ScanStorage(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Analyzing storage devices...");
            ProgressChanged?.Invoke(30);
            LogMessage?.Invoke("Scanning disk drives...");
            
            using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_DiskDrive WHERE MediaType='Fixed hard disk media'"))
            {
                long totalStorage = 0;
                foreach (ManagementObject obj in searcher.Get())
                {
                    totalStorage += Convert.ToInt64(obj["Size"]);
                }
                systemInfo.StorageGb = (int)(totalStorage / (1024 * 1024 * 1024));
            }
        }

        private void ScanSystemInfo(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Reading system information...");
            ProgressChanged?.Invoke(40);
            LogMessage?.Invoke("Gathering system details...");
            
            using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem"))
            {
                foreach (ManagementObject obj in searcher.Get())
                {
                    systemInfo.Manufacturer = obj["Manufacturer"]?.ToString() ?? "Unknown";
                    systemInfo.Model = obj["Model"]?.ToString() ?? "Unknown";
                    break;
                }
            }
        }

        private void ScanBIOS(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Checking BIOS/UEFI configuration...");
            ProgressChanged?.Invoke(50);
            LogMessage?.Invoke("Analyzing firmware settings...");
            
            using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BIOS"))
            {
                foreach (ManagementObject obj in searcher.Get())
                {
                    systemInfo.SerialNumber = obj["SerialNumber"]?.ToString() ?? "Unknown";
                    break;
                }
            }
        }

        private void ScanUEFI(SystemInfo systemInfo)
        {
            systemInfo.UefiCapable = CheckUEFI();
        }

        private void ScanTPM(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Scanning TPM (Trusted Platform Module)...");
            ProgressChanged?.Invoke(60);
            LogMessage?.Invoke("Checking TPM availability and version...");
            
            systemInfo.TmpVersion = GetTPMVersion();
        }

        private void ScanSecureBoot(SystemInfo systemInfo)
        {
            systemInfo.SecureBootCapable = CheckSecureBoot();
        }

        private void ScanDirectX(SystemInfo systemInfo)
        {
            StatusChanged?.Invoke("Checking DirectX version...");
            ProgressChanged?.Invoke(70);
            LogMessage?.Invoke("Analyzing graphics capabilities...");
            
            systemInfo.DirectxVersion = GetDirectXVersion();
        }

        private void ScanDisplay(SystemInfo systemInfo)
        {
            systemInfo.DisplayResolution = $"{Screen.PrimaryScreen.Bounds.Width}x{Screen.PrimaryScreen.Bounds.Height}";
        }

        private void ScanInternetConnection(SystemInfo systemInfo)
        {
            systemInfo.InternetConnection = System.Net.NetworkInformation.NetworkInterface.GetIsNetworkAvailable();
        }

        private bool CheckUEFI()
        {
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control"))
                {
                    var bootInfo = key?.GetValue("PEFirmwareType");
                    return bootInfo != null && bootInfo.ToString() == "2";
                }
            }
            catch
            {
                return false;
            }
        }

        private string GetTPMVersion()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher(@"root\cimv2\security\microsofttpm", "SELECT * FROM Win32_Tpm"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        var version = obj["SpecVersion"]?.ToString();
                        if (!string.IsNullOrEmpty(version))
                        {
                            return version.StartsWith("2.") ? "2.0" : version.StartsWith("1.") ? "1.2" : version;
                        }
                    }
                }
            }
            catch { }
            
            return "Not Detected";
        }

        private bool CheckSecureBoot()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher(@"root\cimv2\security\microsofttpm", "SELECT * FROM Win32_Tpm"))
                {
                    return searcher.Get().Count > 0;
                }
            }
            catch
            {
                return false;
            }
        }

        private string GetDirectXVersion()
        {
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\DirectX"))
                {
                    var version = key?.GetValue("Version")?.ToString();
                    if (!string.IsNullOrEmpty(version))
                    {
                        return version.Contains("12") ? "12" : "11";
                    }
                }
            }
            catch { }
            
            return "11";
        }
    }
}
