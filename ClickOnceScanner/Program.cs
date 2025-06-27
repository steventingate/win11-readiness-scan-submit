
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
            // Create a log file to track what's happening
            string logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Win11Scanner_Debug.txt");
            
            try
            {
                // Write initial log entry
                File.WriteAllText(logPath, $"[{DateTime.Now}] === WIN11 SCANNER DEBUG LOG ===\n");
                File.AppendAllText(logPath, $"[{DateTime.Now}] Application starting from: {Assembly.GetExecutingAssembly().Location}\n");
                File.AppendAllText(logPath, $"[{DateTime.Now}] Working directory: {Environment.CurrentDirectory}\n");
                File.AppendAllText(logPath, $"[{DateTime.Now}] Command line args: {string.Join(" ", args)}\n");
                
                // Show immediate confirmation
                var result = MessageBox.Show(
                    "Win11Scanner Debug Mode\n\n" +
                    "This is a test to confirm the application can run.\n\n" +
                    $"Log file: {logPath}\n\n" +
                    "Click OK to continue with the scanner.",
                    "Scanner Debug Test", 
                    MessageBoxButtons.OKCancel, 
                    MessageBoxIcon.Information);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Initial message box result: {result}\n");
                
                if (result == DialogResult.Cancel)
                {
                    File.AppendAllText(logPath, $"[{DateTime.Now}] User cancelled startup\n");
                    return;
                }
                
                // Initialize Windows Forms
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Windows Forms initialized\n");
                
                // Get session ID
                string sessionId = args.Length > 0 ? args[0] : ExtractSessionIdFromFilename() ?? Guid.NewGuid().ToString();
                File.AppendAllText(logPath, $"[{DateTime.Now}] Session ID: {sessionId}\n");
                
                // Add global exception handlers
                Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
                Application.ThreadException += (sender, e) =>
                {
                    string error = $"Thread Exception: {e.Exception.Message}\n{e.Exception.StackTrace}";
                    File.AppendAllText(logPath, $"[{DateTime.Now}] {error}\n");
                    MessageBox.Show($"Application Error:\n\n{e.Exception.Message}\n\nCheck debug log on desktop.", 
                        "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                };
                
                AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
                {
                    string error = $"Unhandled Exception: {e.ExceptionObject}";
                    File.AppendAllText(logPath, $"[{DateTime.Now}] {error}\n");
                    MessageBox.Show($"Critical Error:\n\n{error}\n\nCheck debug log on desktop.", 
                        "Critical Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                };
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Exception handlers set up\n");
                
                // Try to create the main form
                File.AppendAllText(logPath, $"[{DateTime.Now}] Creating MainForm...\n");
                
                var mainForm = new MainForm(sessionId, logPath);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm created successfully\n");
                
                // Force window visibility
                mainForm.WindowState = FormWindowState.Normal;
                mainForm.ShowInTaskbar = true;
                mainForm.TopMost = true;
                mainForm.Show();
                mainForm.BringToFront();
                mainForm.Activate();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Form shown, starting message loop\n");
                
                // Run the application
                Application.Run(mainForm);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Application.Run completed normally\n");
            }
            catch (Exception ex)
            {
                string criticalError = $"CRITICAL STARTUP ERROR: {ex.Message}\n\nStack Trace:\n{ex.StackTrace}";
                
                try
                {
                    File.AppendAllText(logPath, $"[{DateTime.Now}] {criticalError}\n");
                }
                catch { }
                
                MessageBox.Show(
                    $"Critical startup error!\n\n{ex.Message}\n\nA debug log has been created on your desktop.", 
                    "Startup Failed", 
                    MessageBoxButtons.OK, 
                    MessageBoxIcon.Error);
            }
        }
        
        private static string ExtractSessionIdFromFilename()
        {
            try
            {
                string exePath = Assembly.GetExecutingAssembly().Location;
                string fileName = Path.GetFileNameWithoutExtension(exePath);
                
                if (fileName.StartsWith("Win11Scanner_scan_"))
                {
                    return fileName.Substring("Win11Scanner_".Length);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to extract session ID: {ex.Message}");
            }
            
            return null;
        }
    }
}
