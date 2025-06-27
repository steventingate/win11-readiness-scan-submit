
using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Win11Scanner
{
    public partial class MainForm : Form
    {
        private readonly string sessionId;
        private readonly SystemInfoScanner scanner;
        private readonly UIManager uiManager;
        private readonly DataTransmissionService dataService;

        public MainForm(string sessionId = null)
        {
            try
            {
                this.sessionId = sessionId ?? ExtractSessionIdFromFilename() ?? Guid.NewGuid().ToString();
                this.scanner = new SystemInfoScanner();
                this.uiManager = new UIManager(this);
                this.dataService = new DataTransmissionService();
                
                InitializeComponent();
                SetupEventHandlers();
                this.Load += MainForm_Load;

                // Ensure window is visible and on top
                this.WindowState = FormWindowState.Normal;
                this.ShowInTaskbar = true;
                this.Visible = true;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing scanner: {ex.Message}\n\nDetails: {ex.ToString()}", 
                    "Scanner Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private string ExtractSessionIdFromFilename()
        {
            try
            {
                string exePath = Assembly.GetExecutingAssembly().Location;
                string fileName = Path.GetFileNameWithoutExtension(exePath);
                
                if (fileName.StartsWith("Win11Scanner_scan_"))
                {
                    string sessionPart = fileName.Substring("Win11Scanner_".Length);
                    return sessionPart;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to extract session ID from filename: {ex.Message}");
            }
            
            return null;
        }

        private void InitializeComponent()
        {
            try
            {
                uiManager.InitializeUI(sessionId);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error creating UI: {ex.Message}", "UI Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void SetupEventHandlers()
        {
            try
            {
                uiManager.ScanButtonClick += async (s, e) => await StartScan();
                
                scanner.StatusChanged += status => 
                {
                    try
                    {
                        uiManager.UpdateStatus(status);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error updating status: {ex.Message}");
                    }
                };
                
                scanner.ProgressChanged += progress => 
                {
                    try
                    {
                        uiManager.UpdateProgress(progress);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error updating progress: {ex.Message}");
                    }
                };
                
                scanner.LogMessage += message => 
                {
                    try
                    {
                        uiManager.AppendLog(message);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error logging message: {ex.Message}");
                    }
                };
                
                dataService.LogMessage += message => 
                {
                    try
                    {
                        uiManager.AppendLog(message);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error logging data service message: {ex.Message}");
                    }
                };
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error setting up event handlers: {ex.Message}", "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async void MainForm_Load(object? sender, EventArgs e)
        {
            try
            {
                // Force window to be visible and on top
                this.BringToFront();
                this.Activate();
                this.Focus();
                this.TopMost = true;
                await Task.Delay(100); // Brief delay to ensure window is shown
                this.TopMost = false; // Don't keep it always on top
                
                uiManager.AppendLog($"Scanner initialized with Session ID: {sessionId}");
                uiManager.AppendLog("Ready to scan your system for Windows 11 compatibility.");
                uiManager.AppendLog("Application loaded successfully!");
                
                // Show a message box to confirm the app is running
                MessageBox.Show($"Windows 11 Scanner is now running!\n\nSession ID: {sessionId}\n\nClick 'Start System Scan' to begin.", 
                    "Scanner Ready", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error during form load: {ex.Message}", "Load Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task StartScan()
        {
            try
            {
                uiManager.SetScanningMode(true);
                uiManager.UpdateProgress(0);
                uiManager.ClearResults();
                uiManager.AppendLog("=== WINDOWS 11 COMPATIBILITY SCAN STARTED ===\r\n");

                uiManager.UpdateStatus("Starting comprehensive system scan...", Color.Blue);
                
                var systemInfo = await scanner.ScanSystemAsync(sessionId);
                uiManager.DisplayResults(systemInfo);
                
                uiManager.UpdateStatus("Sending scan results to server...");
                uiManager.UpdateProgress(80);
                
                await dataService.SendDataToServerAsync(systemInfo);
                
                uiManager.UpdateProgress(100);
                uiManager.UpdateStatus("Scan completed successfully! Results sent to server.", Color.Green);
                
                uiManager.AppendLog("\r\n=== SCAN COMPLETE ===");
                uiManager.AppendLog("Results have been sent to the compatibility checker.");
                uiManager.AppendLog("You can now close this window and check your results online.");
                
                uiManager.CloseButton.Enabled = true;
                uiManager.CloseButton.Text = "Close Scanner";
                
                // Show completion message
                MessageBox.Show("Scan completed successfully!\n\nResults have been sent to the web application.", 
                    "Scan Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                await StartCloseCountdown();
            }
            catch (Exception ex)
            {
                string errorMsg = $"Error during scan: {ex.Message}";
                uiManager.UpdateStatus(errorMsg, Color.Red);
                uiManager.AppendLog($"ERROR: {ex.Message}");
                uiManager.AppendLog($"Details: {ex.ToString()}");
                
                MessageBox.Show($"Scan failed!\n\n{errorMsg}\n\nPlease try again or contact support.", 
                    "Scan Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                
                uiManager.SetScanningMode(false);
            }
        }

        private async Task StartCloseCountdown()
        {
            try
            {
                for (int i = 10; i >= 1; i--)
                {
                    uiManager.CloseButton.Text = $"Close ({i}s)";
                    await Task.Delay(1000);
                }
                this.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during countdown: {ex.Message}");
                this.Close();
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                try
                {
                    dataService?.Dispose();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error disposing resources: {ex.Message}");
                }
            }
            base.Dispose(disposing);
        }
    }
}
