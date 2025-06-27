
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
            this.sessionId = sessionId ?? ExtractSessionIdFromFilename() ?? Guid.NewGuid().ToString();
            this.scanner = new SystemInfoScanner();
            this.uiManager = new UIManager(this);
            this.dataService = new DataTransmissionService();
            
            InitializeComponent();
            SetupEventHandlers();
            this.Load += MainForm_Load;
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
            uiManager.InitializeUI(sessionId);
        }

        private void SetupEventHandlers()
        {
            uiManager.ScanButtonClick += async (s, e) => await StartScan();
            
            scanner.StatusChanged += status => uiManager.UpdateStatus(status);
            scanner.ProgressChanged += progress => uiManager.UpdateProgress(progress);
            scanner.LogMessage += message => uiManager.AppendLog(message);
            
            dataService.LogMessage += message => uiManager.AppendLog(message);
        }

        private async void MainForm_Load(object? sender, EventArgs e)
        {
            this.BringToFront();
            this.Activate();
            
            uiManager.AppendLog($"Scanner initialized with Session ID: {sessionId}");
            uiManager.AppendLog("Ready to scan your system for Windows 11 compatibility.");
        }

        private async Task StartScan()
        {
            uiManager.SetScanningMode(true);
            uiManager.UpdateProgress(0);
            uiManager.ClearResults();
            uiManager.AppendLog("=== WINDOWS 11 COMPATIBILITY SCAN STARTED ===\r\n");

            try
            {
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
                
                await StartCloseCountdown();
            }
            catch (Exception ex)
            {
                uiManager.UpdateStatus($"Error during scan: {ex.Message}", Color.Red);
                uiManager.AppendLog($"ERROR: {ex.Message}");
                uiManager.AppendLog($"Details: {ex.ToString()}");
                
                uiManager.SetScanningMode(false);
            }
        }

        private async Task StartCloseCountdown()
        {
            for (int i = 10; i >= 1; i--)
            {
                uiManager.CloseButton.Text = $"Close ({i}s)";
                await Task.Delay(1000);
            }
            this.Close();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                dataService?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
