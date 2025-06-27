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
        private readonly string logPath;

        public MainForm(string sessionId = null)
        {
            this.logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Win11Scanner_Log.txt");
            
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor starting\n");
                
                this.sessionId = sessionId ?? ExtractSessionIdFromFilename() ?? Guid.NewGuid().ToString();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Session ID determined: {this.sessionId}\n");
                
                this.scanner = new SystemInfoScanner();
                this.uiManager = new UIManager(this);
                this.dataService = new DataTransmissionService();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Components created\n");
                
                InitializeComponent();
                SetupEventHandlers();
                this.Load += MainForm_Load;

                // Force window properties
                this.WindowState = FormWindowState.Normal;
                this.ShowInTaskbar = true;
                this.Visible = true;
                this.StartPosition = FormStartPosition.CenterScreen;
                this.TopMost = true;
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor completed successfully\n");
            }
            catch (Exception ex)
            {
                string error = $"Error initializing scanner: {ex.Message}\n\nDetails: {ex.ToString()}";
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor error: {error}\n");
                MessageBox.Show(error, "Scanner Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                File.AppendAllText(logPath, $"[{DateTime.Now}] InitializeComponent starting\n");
                uiManager.InitializeUI(sessionId);
                File.AppendAllText(logPath, $"[{DateTime.Now}] UI initialized successfully\n");
            }
            catch (Exception ex)
            {
                string error = $"Error creating UI: {ex.Message}";
                File.AppendAllText(logPath, $"[{DateTime.Now}] UI creation error: {error}\n");
                MessageBox.Show(error, "UI Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm_Load starting\n");
                
                // Force window to be visible and on top
                this.BringToFront();
                this.Activate();
                this.Focus();
                this.TopMost = true;
                await Task.Delay(100);
                this.TopMost = false;
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Window brought to front\n");
                
                uiManager.AppendLog($"Scanner initialized with Session ID: {sessionId}");
                uiManager.AppendLog("Ready to scan your system for Windows 11 compatibility.");
                uiManager.AppendLog("Application loaded successfully!");
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Log messages added\n");
                
                // Show a message box to confirm the app is running
                MessageBox.Show($"Windows 11 Scanner is now running!\n\nSession ID: {sessionId}\n\nClick 'Start System Scan' to begin.\n\nA log file is being created on your desktop for debugging.", 
                    "Scanner Ready", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Ready message shown, MainForm_Load completed\n");
            }
            catch (Exception ex)
            {
                string error = $"Error during form load: {ex.Message}";
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm_Load error: {error}\n");
                MessageBox.Show(error, "Load Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
