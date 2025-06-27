using System;
using System.Drawing;
using System.Windows.Forms;

namespace Win11Scanner
{
    public class UIManager
    {
        private readonly Form form;
        public Label StatusLabel { get; private set; } = null!;
        public ProgressBar ProgressBar { get; private set; } = null!;
        public Button ScanButton { get; private set; } = null!;
        public TextBox ResultsTextBox { get; private set; } = null!;
        public Button CloseButton { get; private set; } = null!;

        public event EventHandler ScanButtonClick;

        public UIManager(Form form)
        {
            this.form = form;
        }

        public void InitializeUI(string sessionId)
        {
            form.Text = "Windows 11 System Scanner - Helpdesk Computers";
            form.Size = new Size(700, 650);
            form.StartPosition = FormStartPosition.CenterScreen;
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.MaximizeBox = false;
            form.MinimizeBox = true;
            form.TopMost = false;
            form.ShowIcon = true;
            form.ShowInTaskbar = true;

            CreateLabels(sessionId);
            CreateProgressBar();
            CreateButtons();
            CreateResultsTextBox();
            AddControlsToForm();
            InitializeResultsText();
        }

        private void CreateLabels(string sessionId)
        {
            var titleLabel = new Label
            {
                Text = "Windows 11 Compatibility Scanner",
                Font = new Font("Microsoft Sans Serif", 16F, FontStyle.Bold),
                Location = new Point(20, 20),
                Size = new Size(650, 40),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.DarkBlue
            };

            var subtitleLabel = new Label
            {
                Text = "Professional system analysis by Helpdesk Computers",
                Font = new Font("Microsoft Sans Serif", 10F, FontStyle.Regular),
                Location = new Point(20, 65),
                Size = new Size(650, 25),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.Gray
            };

            StatusLabel = new Label
            {
                Text = $"Session ID: {sessionId} | Status: Ready to scan",
                Location = new Point(20, 95),
                Size = new Size(650, 25),
                Font = new Font("Microsoft Sans Serif", 9F, FontStyle.Regular),
                ForeColor = Color.DarkGreen
            };

            var instructionLabel = new Label
            {
                Text = "Click 'Start System Scan' to begin comprehensive hardware analysis",
                Location = new Point(20, 125),
                Size = new Size(650, 25),
                TextAlign = ContentAlignment.MiddleCenter,
                ForeColor = Color.DarkBlue,
                Font = new Font("Microsoft Sans Serif", 10F, FontStyle.Bold)
            };

            form.Controls.AddRange(new Control[] { titleLabel, subtitleLabel, StatusLabel, instructionLabel });
        }

        private void CreateProgressBar()
        {
            ProgressBar = new ProgressBar
            {
                Location = new Point(20, 160),
                Size = new Size(650, 30),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100,
                Value = 0
            };
        }

        private void CreateButtons()
        {
            ScanButton = new Button
            {
                Text = "Start System Scan",
                Location = new Point(220, 200),
                Size = new Size(160, 40),
                UseVisualStyleBackColor = true,
                Font = new Font("Microsoft Sans Serif", 11F, FontStyle.Bold),
                BackColor = Color.LightBlue,
                ForeColor = Color.DarkBlue
            };
            ScanButton.Click += (s, e) => ScanButtonClick?.Invoke(s, e);

            CloseButton = new Button
            {
                Text = "Close",
                Location = new Point(400, 200),
                Size = new Size(100, 40),
                UseVisualStyleBackColor = true,
                Font = new Font("Microsoft Sans Serif", 10F, FontStyle.Regular),
                Enabled = false
            };
            CloseButton.Click += (s, e) => form.Close();
        }

        private void CreateResultsTextBox()
        {
            ResultsTextBox = new TextBox
            {
                Location = new Point(20, 250),
                Size = new Size(650, 350),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Font = new Font("Consolas", 9F, FontStyle.Regular),
                BackColor = Color.Black,
                ForeColor = Color.LimeGreen
            };
        }

        private void AddControlsToForm()
        {
            form.Controls.AddRange(new Control[] { ProgressBar, ScanButton, CloseButton, ResultsTextBox });
        }

        private void InitializeResultsText()
        {
            ResultsTextBox.AppendText("Windows 11 System Scanner Ready\r\n");
            ResultsTextBox.AppendText("Click 'Start System Scan' to begin analysis...\r\n\r\n");
        }

        public void UpdateStatus(string status, Color? color = null)
        {
            if (form.InvokeRequired)
            {
                form.Invoke((MethodInvoker)(() => UpdateStatus(status, color)));
                return;
            }

            StatusLabel.Text = $"Status: {status}";
            if (color.HasValue)
                StatusLabel.ForeColor = color.Value;
        }

        public void UpdateProgress(int value)
        {
            if (form.InvokeRequired)
            {
                form.Invoke((MethodInvoker)(() => UpdateProgress(value)));
                return;
            }

            ProgressBar.Value = Math.Max(0, Math.Min(100, value));
        }

        public void AppendLog(string message)
        {
            if (form.InvokeRequired)
            {
                form.Invoke((MethodInvoker)(() => AppendLog(message)));
                return;
            }

            ResultsTextBox.AppendText($"{message}\r\n");
            ResultsTextBox.SelectionStart = ResultsTextBox.Text.Length;
            ResultsTextBox.ScrollToCaret();
        }

        public void ClearResults()
        {
            if (form.InvokeRequired)
            {
                form.Invoke((MethodInvoker)(() => ClearResults()));
                return;
            }

            ResultsTextBox.Clear();
        }

        public void SetScanningMode(bool isScanning)
        {
            if (form.InvokeRequired)
            {
                form.Invoke((MethodInvoker)(() => SetScanningMode(isScanning)));
                return;
            }

            ScanButton.Enabled = !isScanning;
            CloseButton.Enabled = !isScanning;
        }

        public void DisplayResults(SystemInfo systemInfo)
        {
            if (form.InvokeRequired)
            {
                form.Invoke((MethodInvoker)(() => DisplayResults(systemInfo)));
                return;
            }

            AppendLog("\r\n=== SCAN RESULTS ===");
            AppendLog($"Processor: {systemInfo.Processor}");
            AppendLog($"RAM: {systemInfo.RamGb} GB");
            AppendLog($"Storage: {systemInfo.StorageGb} GB");
            AppendLog($"Manufacturer: {systemInfo.Manufacturer}");
            AppendLog($"Model: {systemInfo.Model}");
            AppendLog($"Serial Number: {systemInfo.SerialNumber}");
            AppendLog($"UEFI Support: {systemInfo.UefiCapable}");
            AppendLog($"TPM Version: {systemInfo.TmpVersion}");
            AppendLog($"Secure Boot: {systemInfo.SecureBootCapable}");
            AppendLog($"DirectX Version: {systemInfo.DirectxVersion}");
            AppendLog($"Display Resolution: {systemInfo.DisplayResolution}");
            AppendLog($"Internet Connection: {systemInfo.InternetConnection}");
        }
    }
}
