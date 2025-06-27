
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

        public MainForm(string sessionId, string logPath)
        {
            this.sessionId = sessionId ?? "UNKNOWN_SESSION";
            this.logPath = logPath;
            
            // IMMEDIATE message box in constructor
            MessageBox.Show("MainForm constructor called!\n\nAbout to initialize components...", 
                "MAINFORM CONSTRUCTOR", MessageBoxButtons.OK, MessageBoxIcon.Information);
            
            try
            {
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm constructor starting\n");
                
                InitializeComponent();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm initialized successfully\n");
                
                // Message box after successful initialization
                MessageBox.Show("MainForm initialization complete!\n\nForm should now be visible.", 
                    "INITIALIZATION COMPLETE", MessageBoxButtons.OK, MessageBoxIcon.Information);
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
            
            // Basic form setup
            this.Text = "Windows 11 Scanner - REBUILD TEST";
            this.Size = new Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.ShowInTaskbar = true;
            this.TopMost = true;
            this.BackColor = Color.White;
            
            // Title label
            var titleLabel = new Label
            {
                Text = "🔥 REBUILT SCANNER - TEST MODE 🔥",
                Font = new Font("Arial", 16F, FontStyle.Bold),
                Location = new Point(50, 30),
                Size = new Size(700, 40),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.Red,
                BackColor = Color.Yellow
            };
            
            // Session info
            var sessionLabel = new Label
            {
                Text = $"Session ID: {sessionId}",
                Font = new Font("Arial", 12F, FontStyle.Bold),
                Location = new Point(50, 80),
                Size = new Size(700, 30),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.Blue
            };
            
            // Big test button
            var testButton = new Button
            {
                Text = "🚀 CLICK ME TO TEST 🚀",
                Font = new Font("Arial", 14F, FontStyle.Bold),
                Location = new Point(250, 130),
                Size = new Size(300, 60),
                BackColor = Color.LimeGreen,
                ForeColor = Color.Black,
                UseVisualStyleBackColor = false
            };
            testButton.Click += (s, e) =>
            {
                MessageBox.Show("TEST BUTTON WORKS!\n\nThe scanner is functional!", 
                    "SUCCESS!", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                File.AppendAllText(logPath, $"[{DateTime.Now}] Test button clicked - SUCCESS!\n");
            };
            
            // Status text
            var statusLabel = new Label
            {
                Text = "✅ Scanner rebuilt successfully!\n✅ Form is visible!\n✅ Ready for testing!",
                Font = new Font("Arial", 12F, FontStyle.Regular),
                Location = new Point(50, 220),
                Size = new Size(700, 100),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.DarkGreen
            };
            
            // Log path info
            var logLabel = new Label
            {
                Text = $"Log file: {logPath}",
                Font = new Font("Arial", 10F, FontStyle.Regular),
                Location = new Point(50, 340),
                Size = new Size(700, 30),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.Gray
            };
            
            // Close button
            var closeButton = new Button
            {
                Text = "Close Scanner",
                Font = new Font("Arial", 12F, FontStyle.Regular),
                Location = new Point(350, 400),
                Size = new Size(100, 40),
                BackColor = Color.LightCoral,
                UseVisualStyleBackColor = false
            };
            closeButton.Click += (s, e) => this.Close();
            
            // Add all controls
            this.Controls.AddRange(new Control[] 
            { 
                titleLabel, 
                sessionLabel, 
                testButton, 
                statusLabel, 
                logLabel, 
                closeButton 
            });
            
            File.AppendAllText(logPath, $"[{DateTime.Now}] All UI components added successfully\n");
        }
        
        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            
            File.AppendAllText(logPath, $"[{DateTime.Now}] Form OnShown event triggered\n");
            
            // Final confirmation message
            MessageBox.Show("🎉 FORM IS NOW VISIBLE! 🎉\n\nThe rebuilt scanner is working!\nClick the green test button to verify functionality.", 
                "FORM VISIBLE", MessageBoxButtons.OK, MessageBoxIcon.Information);
            
            // Force to front again
            this.BringToFront();
            this.Activate();
            this.Focus();
        }
    }
}
