
using System;
using System.IO;
using System.Windows.Forms;
using System.Diagnostics;
using System.Reflection;

namespace Win11Scanner
{
    internal static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            // IMMEDIATE MESSAGE BOX - This should show before anything else
            MessageBox.Show("Win11Scanner is starting up!\n\nThis is the FIRST thing you should see.", 
                "SCANNER STARTUP", MessageBoxButtons.OK, MessageBoxIcon.Information);
            
            string logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Win11Scanner_StartupLog.txt");
            
            try
            {
                // Write to log immediately
                File.WriteAllText(logPath, $"[{DateTime.Now}] SCANNER STARTED\n");
                File.AppendAllText(logPath, $"[{DateTime.Now}] Executable location: {Assembly.GetExecutingAssembly().Location}\n");
                File.AppendAllText(logPath, $"[{DateTime.Now}] Working directory: {Environment.CurrentDirectory}\n");
                File.AppendAllText(logPath, $"[{DateTime.Now}] Command line args: {string.Join(" ", args)}\n");
                
                // Second message box to confirm logging
                MessageBox.Show($"Log file created at:\n{logPath}\n\nStarting Windows Forms...", 
                    "LOG CREATED", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Windows Forms initialized\n");
                
                // Get session ID - try multiple methods
                string sessionId = ExtractSessionId(args);
                File.AppendAllText(logPath, $"[{DateTime.Now}] Session ID: {sessionId}\n");
                
                // Third message box before creating form
                MessageBox.Show($"About to create main form with session: {sessionId}", 
                    "CREATING FORM", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                // Create and show form
                var mainForm = new MainForm(sessionId, logPath);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm created\n");
                
                // Force window to be visible
                mainForm.WindowState = FormWindowState.Normal;
                mainForm.TopMost = true;
                mainForm.ShowInTaskbar = true;
                mainForm.Show();
                mainForm.BringToFront();
                mainForm.Activate();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Form shown, entering message loop\n");
                
                // Run application
                Application.Run(mainForm);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Application completed\n");
            }
            catch (Exception ex)
            {
                string error = $"CRITICAL ERROR: {ex.Message}\n\nStack Trace:\n{ex.StackTrace}";
                
                try
                {
                    File.AppendAllText(logPath, $"[{DateTime.Now}] {error}\n");
                }
                catch { }
                
                MessageBox.Show(error, "CRITICAL ERROR", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        
        private static string ExtractSessionId(string[] args)
        {
            try
            {
                // Method 1: Check command line arguments
                if (args.Length > 0)
                {
                    return args[0];
                }
                
                // Method 2: Extract from executable filename
                string exePath = Assembly.GetExecutingAssembly().Location;
                string fileName = Path.GetFileNameWithoutExtension(exePath);
                
                if (fileName.StartsWith("Win11Scanner_"))
                {
                    return fileName.Substring("Win11Scanner_".Length);
                }
                
                // Method 3: Check if the executable was renamed with session ID
                string[] parts = fileName.Split('_');
                if (parts.Length >= 2 && parts[0] == "Win11Scanner")
                {
                    return string.Join("_", parts, 1, parts.Length - 1);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Session ID extraction failed: {ex.Message}", "WARNING", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
            
            return "DEFAULT_SESSION";
        }
    }
}
