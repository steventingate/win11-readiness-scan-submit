
using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace Win11Scanner
{
    public partial class MainForm : Form
    {
        private readonly string sessionId;
        private readonly string logPath;
        
        // Simple UI controls
        private Label titleLabel;
        private Label sessionLabel;
        private Button testButton;
        private TextBox logTextBox;
        private Button closeButton;

        public MainForm(string sessionId, string logPath)
        {
            this.sessionId = sessionId ?? Guid.NewGuid().ToString();
            this.logPath = logPath;
            
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor starting\n");
                
                InitializeComponent();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm initialized successfully\n");
            }
            catch (Exception ex)
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor error: {ex.Message}\n");
                MessageBox.Show($"Error initializing form: {ex.Message}", "Form Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void InitializeComponent()
        {
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] InitializeComponent starting\n");
                
                // Form properties
                this.Text = "Windows 11 System Scanner - TEST MODE";
                this.Size = new Size(600, 500);
                this.StartPosition = FormStartPosition.CenterScreen;
                this.FormBorderStyle = FormBorderStyle.FixedDialog;
                this.MaximizeBox = false;
                this.MinimizeBox = true;
                this.ShowInTaskbar = true;
                this.TopMost = false;
                
                // Title label
                titleLabel = new Label
                {
                    Text = "Windows 11 Scanner - Debug Mode",
                    Font = new Font("Microsoft Sans Serif", 14F, FontStyle.Bold),
                    Location = new Point(20, 20),
                    Size = new Size(550, 30),
                    TextAlign = ContentAlignment.MiddleCenter,
                    ForeColor = Color.DarkBlue
                };
                
                // Session label
                sessionLabel = new Label
                {
                    Text = $"Session ID: {sessionId}",
                    Location = new Point(20, 60),
                    Size = new Size(550, 20),
                    TextAlign = ContentAlignment.MiddleCenter,
                    ForeColor = Color.DarkGreen
                };
                
                // Test button
                testButton = new Button
                {
                    Text = "Test Scanner (Click Me!)",
                    Location = new Point(200, 90),
                    Size = new Size(200, 40),
                    UseVisualStyleBackColor = true,
                    Font = new Font("Microsoft Sans Serif", 10F, FontStyle.Bold),
                    BackColor = Color.LightGreen
                };
                testButton.Click += TestButton_Click;
                
                // Log text box
                logTextBox = new TextBox
                {
                    Location = new Point(20, 140),
                    Size = new Size(550, 250),
                    Multiline = true,
                    ScrollBars = ScrollBars.Vertical,
                    ReadOnly = true,
                    Font = new Font("Consolas", 9F),
                    BackColor = Color.Black,
                    ForeColor = Color.LimeGreen
                };
                
                // Close button
                closeButton = new Button
                {
                    Text = "Close Scanner",
                    Location = new Point(250, 400),
                    Size = new Size(100, 30),
                    UseVisualStyleBackColor = true
                };
                closeButton.Click += (s, e) => this.Close();
                
                // Add controls to form
                this.Controls.AddRange(new Control[] 
                { 
                    titleLabel, 
                    sessionLabel, 
                    testButton, 
                    logTextBox, 
                    closeButton 
                });
                
                // Initialize log
                AppendToLog("Windows 11 Scanner initialized successfully!");
                AppendToLog($"Session ID: {sessionId}");
                AppendToLog("Click 'Test Scanner' to verify functionality.");
                AppendToLog($"Debug log file: {logPath}");
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] All UI components created successfully\n");
            }
            catch (Exception ex)
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] InitializeComponent error: {ex.Message}\n");
                MessageBox.Show($"Error creating UI: {ex.Message}", "UI Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        
        private void TestButton_Click(object sender, EventArgs e)
        {
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] Test button clicked\n");
                
                AppendToLog("=== SCANNER TEST STARTED ===");
                AppendToLog("Testing system information collection...");
                
                // Basic system info test
                AppendToLog($"Computer Name: {Environment.MachineName}");
                AppendToLog($"User Name: {Environment.UserName}");
                AppendToLog($"OS Version: {Environment.OSVersion}");
                AppendToLog($"Processor Count: {Environment.ProcessorCount}");
                AppendToLog($"Working Set: {Environment.WorkingSet / 1024 / 1024} MB");
                
                AppendToLog("=== TEST COMPLETED SUCCESSFULLY ===");
                AppendToLog("The scanner is working! This confirms the application can run.");
                
                MessageBox.Show(
                    "Scanner test completed successfully!\n\n" +
                    "The application is working properly.\n" +
                    "Check the log window for system information.",
                    "Test Successful",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Test completed successfully\n");
            }
            catch (Exception ex)
            {
                string error = $"Test failed: {ex.Message}";
                File.AppendAllText(logPath, $"[{DateTime.Now}] {error}\n");
                AppendToLog($"ERROR: {error}");
                MessageBox.Show(error, "Test Failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        
        private void AppendToLog(string message)
        {
            if (logTextBox.InvokeRequired)
            {
                logTextBox.Invoke((MethodInvoker)(() => AppendToLog(message)));
                return;
            }
            
            logTextBox.AppendText($"{DateTime.Now:HH:mm:ss} - {message}\r\n");
            logTextBox.SelectionStart = logTextBox.Text.Length;
            logTextBox.ScrollToCaret();
        }
        
        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] Form shown event triggered\n");
                
                // Force to front
                this.BringToFront();
                this.Activate();
                this.Focus();
                
                // Show confirmation that form is visible
                MessageBox.Show(
                    "Windows 11 Scanner is now visible!\n\n" +
                    "This confirms the application window is working.\n" +
                    "Click 'Test Scanner' to verify functionality.",
                    "Scanner Window Active",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Form visibility confirmed\n");
            }
            catch (Exception ex)
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] OnShown error: {ex.Message}\n");
            }
        }
    }
}
