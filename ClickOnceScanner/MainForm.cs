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
using System.IO;
using System.Reflection;

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
        private Label titleLabel = null!;
        private Button closeButton = null!;

        public MainForm(string sessionId = null)
        {
            this.sessionId = sessionId ?? ExtractSessionIdFromFilename() ?? Guid.NewGuid().ToString();
            this.httpClient = new HttpClient();
            InitializeComponent();
            this.Load += MainForm_Load;
        }

        private string ExtractSessionIdFromFilename()
        {
            try
            {
                // Get the current executable path
                string exePath = Assembly.GetExecutingAssembly().Location;
                string fileName = Path.GetFileNameWithoutExtension(exePath);
                
                // Check if filename contains session ID pattern: Win11Scanner_scan_timestamp_randomstring
                if (fileName.StartsWith("Win11Scanner_scan_"))
                {
                    string sessionPart = fileName.Substring("Win11Scanner_".Length);
                    return sessionPart;
                }
            }
            catch (Exception ex)
            {
                // If extraction fails, we'll use a generated GUID
                Console.WriteLine($"Failed to extract session ID from filename: {ex.Message}");
            }
            
            return null;
        }

        private void InitializeComponent()
        {
            this.Text = "Windows 11 System Scanner - Helpdesk Computers";
            this.Size = new System.Drawing.Size(700, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.TopMost = true; // Make sure window appears on top

            titleLabel = new Label
            {
                Text = "Windows 11 Compatibility Scanner",
                Font = new System.Drawing.Font("Microsoft Sans Serif", 14F, System.Drawing.FontStyle.Bold),
                Location = new System.Drawing.Point(20, 20),
                Size = new System.Drawing.Size(650, 35),
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter,
                ForeColor = System.Drawing.Color.DarkBlue
            };

            var subtitleLabel = new Label
            {
                Text = "Professional system analysis by Helpdesk Computers",
                Font = new System.Drawing.Font("Microsoft Sans Serif", 10F, System.Drawing.FontStyle.Regular),
                Location = new System.Drawing.Point(20, 55),
                Size = new System.Drawing.Size(650, 20),
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter,
                ForeColor = System.Drawing.Color.Gray
            };

            statusLabel = new Label
            {
                Text = $"Session ID: {sessionId}",
                Location = new System.Drawing.Point(20, 90),
                Size = new System.Drawing.Size(650, 20),
                Font = new System.Drawing.Font("Microsoft Sans Serif", 9F, System.Drawing.FontStyle.Regular)
            };

            var instructionLabel = new Label
            {
                Text = "Click 'Start System Scan' to begin comprehensive hardware analysis",
                Location = new System.Drawing.Point(20, 115),
                Size = new System.Drawing.Size(650, 20),
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter,
                ForeColor = System.Drawing.Color.DarkGreen
            };

            progressBar = new ProgressBar
            {
                Location = new System.Drawing.Point(20, 145),
                Size = new System.Drawing.Size(650, 25),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100,
                Value = 0
            };

            scanButton = new Button
            {
                Text = "Start System Scan",
                Location = new System.Drawing.Point(250, 180),
                Size = new System.Drawing.Size(150, 35),
                UseVisualStyleBackColor = true,
                Font = new System.Drawing.Font("Microsoft Sans Serif", 10F, System.Drawing.FontStyle.Bold),
                BackColor = System.Drawing.Color.LightBlue
            };
            scanButton.Click += ScanButton_Click;

            closeButton = new Button
            {
                Text = "Close",
                Location = new System.Drawing.Point(420, 180),
                Size = new System.Drawing.Size(100, 35),
                UseVisualStyleBackColor = true,
                Enabled = false
            };
            closeButton.Click += (s, e) => this.Close();

            resultsTextBox = new TextBox
            {
                Location = new System.Drawing.Point(20, 230),
                Size = new System.Drawing.Size(650, 300),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Font = new System.Drawing.Font("Consolas", 9F, System.Drawing.FontStyle.Regular),
                BackColor = System.Drawing.Color.Black,
                ForeColor = System.Drawing.Color.LimeGreen
            };

            this.Controls.AddRange(new Control[] { 
                titleLabel, subtitleLabel, statusLabel, instructionLabel, 
                progressBar, scanButton, closeButton, resultsTextBox 
            });

            // Add initial message to results
            resultsTextBox.AppendText("Windows 11 System Scanner Ready\r\n");
            resultsTextBox.AppendText("Click 'Start System Scan' to begin analysis...\r\n\r\n");
        }

        private async void MainForm_Load(object? sender, EventArgs e)
        {
            // Show a welcome message instead of auto-starting
            this.BringToFront(); // Make sure window is visible
            this.Activate(); // Give it focus
            
            resultsTextBox.AppendText($"Scanner initialized with Session ID: {sessionId}\r\n");
            resultsTextBox.AppendText("Ready to scan your system for Windows 11 compatibility.\r\n\r\n");
        }

        private async void ScanButton_Click(object? sender, EventArgs e)
        {
            await StartScan();
        }

        private async Task StartScan()
        {
            scanButton.Enabled = false;
            closeButton.Enabled = false;
            progressBar.Value = 0;
            resultsTextBox.Clear();
            resultsTextBox.AppendText("=== WINDOWS 11 COMPATIBILITY SCAN STARTED ===\r\n\r\n");

            try
            {
                statusLabel.Text = "Starting comprehensive system scan...";
                statusLabel.ForeColor = System.Drawing.Color.Blue;
                
                var systemInfo = await ScanSystemAsync();
                
                statusLabel.Text = "Sending scan results to server...";
                progressBar.Value = 80;
                
                await SendDataToServerAsync(systemInfo);
                
                progressBar.Value = 100;
                statusLabel.Text = "Scan completed successfully! Results sent to server.";
                statusLabel.ForeColor = System.Drawing.Color.Green;
                
                resultsTextBox.AppendText("\r\n=== SCAN COMPLETE ===\r\n");
                resultsTextBox.AppendText("Results have been sent to the compatibility checker.\r\n");
                resultsTextBox.AppendText("You can now close this window and check your results online.\r\n");
                
                closeButton.Enabled = true;
                closeButton.Text = "Close Scanner";
                
                // Auto-close after 10 seconds with countdown
                for (int i = 10; i >= 1; i--)
                {
                    closeButton.Text = $"Close ({i}s)";
                    await Task.Delay(1000);
                }
                this.Close();
            }
            catch (Exception ex)
            {
                statusLabel.Text = $"Error during scan: {ex.Message}";
                statusLabel.ForeColor = System.Drawing.Color.Red;
                resultsTextBox.AppendText($"\r\nERROR: {ex.Message}\r\n");
                resultsTextBox.AppendText($"Details: {ex.ToString()}\r\n");
                
                scanButton.Enabled = true;
                closeButton.Enabled = true;
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
                        statusLabel.Text = "Scanning processor information...";
                        progressBar.Value = 10;
                        resultsTextBox.AppendText("Analyzing CPU specifications...\r\n");
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
                        statusLabel.Text = "Scanning memory configuration...";
                        progressBar.Value = 20;
                        resultsTextBox.AppendText("Checking RAM specifications...\r\n");
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
                        statusLabel.Text = "Analyzing storage devices...";
                        progressBar.Value = 30;
                        resultsTextBox.AppendText("Scanning disk drives...\r\n");
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
                        statusLabel.Text = "Reading system information...";
                        progressBar.Value = 40;
                        resultsTextBox.AppendText("Gathering system details...\r\n");
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
                        statusLabel.Text = "Checking BIOS/UEFI configuration...";
                        progressBar.Value = 50;
                        resultsTextBox.AppendText("Analyzing firmware settings...\r\n");
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
                        statusLabel.Text = "Scanning TPM (Trusted Platform Module)...";
                        progressBar.Value = 60;
                        resultsTextBox.AppendText("Checking TPM availability and version...\r\n");
                    }));
                    
                    systemInfo.TmpVersion = GetTPMVersion();

                    // Check Secure Boot
                    systemInfo.SecureBootCapable = CheckSecureBoot();

                    // Get DirectX version
                    this.Invoke((MethodInvoker)(() => {
                        statusLabel.Text = "Checking DirectX version...";
                        progressBar.Value = 70;
                        resultsTextBox.AppendText("Analyzing graphics capabilities...\r\n");
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
                resultsTextBox.AppendText("\r\n=== SCAN RESULTS ===\r\n");
                resultsTextBox.AppendText($"Processor: {systemInfo.Processor}\r\n");
                resultsTextBox.AppendText($"RAM: {systemInfo.RamGb} GB\r\n");
                resultsTextBox.AppendText($"Storage: {systemInfo.StorageGb} GB\r\n");
                resultsTextBox.AppendText($"Manufacturer: {systemInfo.Manufacturer}\r\n");
                resultsTextBox.AppendText($"Model: {systemInfo.Model}\r\n");
                resultsTextBox.AppendText($"Serial Number: {systemInfo.SerialNumber}\r\n");
                resultsTextBox.AppendText($"UEFI Support: {systemInfo.UefiCapable}\r\n");
                resultsTextBox.AppendText($"TPM Version: {systemInfo.TmpVersion}\r\n");
                resultsTextBox.AppendText($"Secure Boot: {systemInfo.SecureBootCapable}\r\n");
                resultsTextBox.AppendText($"DirectX Version: {systemInfo.DirectxVersion}\r\n");
                resultsTextBox.AppendText($"Display Resolution: {systemInfo.DisplayResolution}\r\n");
                resultsTextBox.AppendText($"Internet Connection: {systemInfo.InternetConnection}\r\n");
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
                        resultsTextBox.AppendText("\r\nData successfully sent to compatibility checker!\r\n");
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
                    resultsTextBox.AppendText($"\r\nError sending data to server: {ex.Message}\r\n");
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
