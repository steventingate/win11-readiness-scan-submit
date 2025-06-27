
using System;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Win11Scanner
{
    public partial class MainForm : Form
    {
        private readonly string sessionId;
        private readonly string logPath;
        private readonly SystemInfoScanner scanner;
        private readonly DataTransmissionService dataService;
        private readonly UIManager uiManager;

        public MainForm(string sessionId, string logPath)
        {
            this.sessionId = sessionId ?? "DEFAULT_SESSION";
            this.logPath = logPath;
            
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor starting\n");
                
                InitializeComponent();
                
                // Initialize services
                scanner = new SystemInfoScanner();
                dataService = new DataTransmissionService();
                uiManager = new UIManager(this);
                
                // Wire up events
                scanner.StatusChanged += status => uiManager.UpdateStatus(status);
                scanner.ProgressChanged += progress => uiManager.UpdateProgress(progress);
                scanner.LogMessage += message => uiManager.AppendLog(message);
                dataService.LogMessage += message => uiManager.AppendLog(message);
                uiManager.ScanButtonClick += OnScanButtonClick;
                
                // Initialize UI
                uiManager.InitializeUI(this.sessionId);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm initialized successfully with session: {this.sessionId}\n");
            }
            catch (Exception ex)
            {
                string error = $"MainForm initialization failed: {ex.Message}";
                File.AppendAllText(logPath, $"[{DateTime.Now}] {error}\n");
                MessageBox.Show(error, "MAINFORM ERROR", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void InitializeComponent()
        {
            File.AppendAllText(logPath, $"[{DateTime.Now}] InitializeComponent starting\n");
            
            // Basic form setup - minimal for now, UIManager will handle the rest
            this.Text = "Windows 11 Scanner";
            this.Size = new Size(700, 650);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.ShowInTaskbar = true;
            this.BackColor = Color.White;
            
            File.AppendAllText(logPath, $"[{DateTime.Now}] InitializeComponent completed\n");
        }
        
        private async void OnScanButtonClick(object sender, EventArgs e)
        {
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] Starting system scan\n");
                
                uiManager.SetScanningMode(true);
                uiManager.ClearResults();
                uiManager.UpdateStatus("Starting system scan...");
                uiManager.AppendLog("=== SYSTEM SCAN STARTED ===");
                
                // Perform the scan
                var systemInfo = await scanner.ScanSystemAsync(sessionId);
                
                // Display results
                uiManager.DisplayResults(systemInfo);
                uiManager.UpdateStatus("Scan completed, sending data...");
                
                // Send to server
                await dataService.SendDataToServerAsync(systemInfo);
                
                uiManager.UpdateStatus("Scan completed successfully!", Color.Green);
                uiManager.AppendLog("=== SCAN COMPLETED SUCCESSFULLY ===");
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Scan completed successfully\n");
            }
            catch (Exception ex)
            {
                string error = $"Scan failed: {ex.Message}";
                uiManager.UpdateStatus(error, Color.Red);
                uiManager.AppendLog($"ERROR: {error}");
                File.AppendAllText(logPath, $"[{DateTime.Now}] {error}\n");
                
                MessageBox.Show(error, "Scan Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                uiManager.SetScanningMode(false);
            }
        }
        
        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            File.AppendAllText(logPath, $"[{DateTime.Now}] Form OnShown event triggered\n");
            this.BringToFront();
            this.Activate();
            this.Focus();
        }
    }
}
