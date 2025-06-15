using System;
using System.Collections.Generic;
using System.Management;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;
using System.Security.Principal;

namespace Win11Scanner
{
    public partial class MainForm : Form
    {
        private readonly string sessionId;
        private readonly HttpClient httpClient;
        private Label statusLabel = null!;
        private ProgressBar progressBar = null!;
        private Button scanButton = null!;
        private TextBox resultsTextBox = null!;

        public MainForm(string sessionId)
        {
            this.sessionId = sessionId;
            this.httpClient = new HttpClient();
            InitializeComponent();
            this.Load += MainForm_Load;
        }

        private void InitializeComponent()
        {
            this.Text = "Windows 11 System Scanner";
            this.Size = new System.Drawing.Size(600, 500);
            this.StartPosition = FormStartPosition.CenterScreen;

            var titleLabel = new Label
            {
                Text = "Windows 11 Compatibility Scanner",
                Font = new System.Drawing.Font("Microsoft Sans Serif", 12F, System.Drawing.FontStyle.Bold),
                Location = new System.Drawing.Point(20, 20),
                Size = new System.Drawing.Size(550, 30),
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter
            };

            statusLabel = new Label
            {
                Text = $"Session ID: {sessionId}",
                Location = new System.Drawing.Point(20, 60),
                Size = new System.Drawing.Size(550, 20)
            };

            progressBar = new ProgressBar
            {
                Location = new System.Drawing.Point(20, 90),
                Size = new System.Drawing.Size(550, 20),
                Style = ProgressBarStyle.Continuous
            };

            scanButton = new Button
            {
                Text = "Start System Scan",
                Location = new System.Drawing.Point(250, 120),
                Size = new System.Drawing.Size(100, 30),
                UseVisualStyleBackColor = true
            };
            scanButton.Click += ScanButton_Click;

            resultsTextBox = new TextBox
            {
                Location = new System.Drawing.Point(20, 160),
                Size = new System.Drawing.Size(550, 280),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true
            };

            this.Controls.AddRange(new Control[] { titleLabel, statusLabel, progressBar, scanButton, resultsTextBox });
        }

        private async void MainForm_Load(object? sender, EventArgs e)
        {
            // Auto-start scanning when form loads
            await StartScan();
        }

        private async void ScanButton_Click(object? sender, EventArgs e)
        {
            await StartScan();
        }

        private async Task StartScan()
        {
            scanButton.Enabled = false;
            progressBar.Value = 0;
            resultsTextBox.Clear();

            try
            {
                statusLabel.Text = "Starting system scan...";
                var systemInfo = await ScanSystemAsync();
                
                statusLabel.Text = "Sending data to server...";
                progressBar.Value = 80;
                
                await SendDataToServerAsync(systemInfo);
                
                progressBar.Value = 100;
                statusLabel.Text = "Scan completed successfully!";
                
                // Auto-close after 3 seconds
                await Task.Delay(3000);
                this.Close();
            }
            catch (Exception ex)
            {
                statusLabel.Text = $"Error: {ex.Message}";
                resultsTextBox.AppendText($"Error: {ex.Message}\r\n");
            }
            finally
            {
                scanButton.Enabled = true;
            }
        }

        private async Task<SystemInfo> ScanSystemAsync()
        {
            var systemInfo = new SystemInfo { SessionId = sessionId };
            
            await Task.Run(() =>
            {
                try
                {
                    // Get processor information
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning processor...";
                        progressBar.Value = 10;
                    }));
                    
                    using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor"))
                    {
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            systemInfo.Processor = obj["Name"]?.ToString() ?? "Unknown";
                            break;
                        }
                    }

                    // Get memory information
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning memory...";
                        progressBar.Value = 20;
                    }));
                    
                    using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory"))
                    {
                        long totalMemory = 0;
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            totalMemory += Convert.ToInt64(obj["Capacity"]);
                        }
                        systemInfo.RamGb = (int)(totalMemory / (1024 * 1024 * 1024));
                    }

                    // Get storage information
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning storage...";
                        progressBar.Value = 30;
                    }));
                    
                    using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_DiskDrive WHERE MediaType='Fixed hard disk media'"))
                    {
                        long totalStorage = 0;
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            totalStorage += Convert.ToInt64(obj["Size"]);
                        }
                        systemInfo.StorageGb = (int)(totalStorage / (1024 * 1024 * 1024));
                    }

                    // Get system information
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning system info...";
                        progressBar.Value = 40;
                    }));
                    
                    using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem"))
                    {
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            systemInfo.Manufacturer = obj["Manufacturer"]?.ToString() ?? "Unknown";
                            systemInfo.Model = obj["Model"]?.ToString() ?? "Unknown";
                            break;
                        }
                    }

                    // Get BIOS information
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning BIOS/UEFI...";
                        progressBar.Value = 50;
                    }));
                    
                    using (var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BIOS"))
                    {
                        foreach (ManagementObject obj in searcher.Get())
                        {
                            systemInfo.SerialNumber = obj["SerialNumber"]?.ToString() ?? "Unknown";
                            break;
                        }
                    }

                    // Check UEFI
                    systemInfo.UefiCapable = CheckUEFI();

                    // Check TPM
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning TPM...";
                        progressBar.Value = 60;
                    }));
                    
                    systemInfo.TmpVersion = GetTPMVersion();

                    // Check Secure Boot
                    systemInfo.SecureBootCapable = CheckSecureBoot();

                    // Get DirectX version
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Scanning DirectX...";
                        progressBar.Value = 70;
                    }));
                    
                    systemInfo.DirectxVersion = GetDirectXVersion();

                    // Get display resolution
                    systemInfo.DisplayResolution = $"{Screen.PrimaryScreen.Bounds.Width}x{Screen.PrimaryScreen.Bounds.Height}";

                    // Check internet connection
                    systemInfo.InternetConnection = System.Net.NetworkInformation.NetworkInterface.GetIsNetworkAvailable();

                }
                catch (Exception ex)
                {
                    this.Invoke((MethodInvoker)(() => {
                        resultsTextBox.AppendText($"Scan error: {ex.Message}\r\n");
                    }));
                }
            });

            // Display results
            this.Invoke((MethodInvoker)(() => {
                resultsTextBox.AppendText($"Processor: {systemInfo.Processor}\r\n");
                resultsTextBox.AppendText($"RAM: {systemInfo.RamGb} GB\r\n");
                resultsTextBox.AppendText($"Storage: {systemInfo.StorageGb} GB\r\n");
                resultsTextBox.AppendText($"Manufacturer: {systemInfo.Manufacturer}\r\n");
                resultsTextBox.AppendText($"Model: {systemInfo.Model}\r\n");
                resultsTextBox.AppendText($"Serial: {systemInfo.SerialNumber}\r\n");
                resultsTextBox.AppendText($"UEFI: {systemInfo.UefiCapable}\r\n");
                resultsTextBox.AppendText($"TPM: {systemInfo.TmpVersion}\r\n");
                resultsTextBox.AppendText($"Secure Boot: {systemInfo.SecureBootCapable}\r\n");
                resultsTextBox.AppendText($"DirectX: {systemInfo.DirectxVersion}\r\n");
                resultsTextBox.AppendText($"Display: {systemInfo.DisplayResolution}\r\n");
                resultsTextBox.AppendText($"Internet: {systemInfo.InternetConnection}\r\n");
            }));

            return systemInfo;
        }

        private bool CheckUEFI()
        {
            try
            {
                using (var key = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control"))
                {
                    var bootInfo = key?.GetValue("PEFirmwareType");
                    return bootInfo != null && bootInfo.ToString() == "2"; // 2 = UEFI
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

        private async Task SendDataToServerAsync(SystemInfo systemInfo)
        {
            try
            {
                var json = JsonSerializer.Serialize(systemInfo, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                // Send to your Supabase function
                var response = await httpClient.PostAsync(
                    "https://sfdiidxypdadqspafvlc.supabase.co/functions/v1/submit-system-scan",
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    this.Invoke((MethodInvoker)(() => {
                        resultsTextBox.AppendText("\r\nData sent successfully to server!\r\n");
                    }));
                }
                else
                {
                    throw new Exception($"Server responded with: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                this.Invoke((MethodInvoker)(() => {
                    resultsTextBox.AppendText($"\r\nError sending data: {ex.Message}\r\n");
                }));
                throw;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                httpClient?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    public class SystemInfo
    {
        public string SessionId { get; set; } = string.Empty;
        public string Processor { get; set; } = string.Empty;
        public int RamGb { get; set; }
        public int StorageGb { get; set; }
        public string Manufacturer { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public bool UefiCapable { get; set; }
        public string TmpVersion { get; set; } = string.Empty;
        public bool SecureBootCapable { get; set; }
        public string DirectxVersion { get; set; } = string.Empty;
        public string DisplayResolution { get; set; } = string.Empty;
        public bool InternetConnection { get; set; }
    }
}
