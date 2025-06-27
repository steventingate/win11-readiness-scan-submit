
using System;
using System.IO;
using System.Windows.Forms;
using System.Diagnostics;

namespace Win11Scanner
{
    internal static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            // Create a log file to track what's happening
            string logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Win11Scanner_Log.txt");
            
            try
            {
                File.WriteAllText(logPath, $"[{DateTime.Now}] Application starting...\n");
                
                // Show immediate confirmation the app is running
                MessageBox.Show("Win11Scanner is starting up!\n\nThis message confirms the application is running.", 
                    "Scanner Starting", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Startup message shown\n");
                
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Visual styles enabled\n");
                
                // Get session ID from command line or generate one
                string sessionId = args.Length > 0 ? args[0] : Guid.NewGuid().ToString();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Session ID: {sessionId}\n");
                
                // Add global exception handler
                Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
                Application.ThreadException += (sender, e) =>
                {
                    string error = $"Application Error: {e.Exception.Message}\n\nDetails: {e.Exception.ToString()}";
                    File.AppendAllText(logPath, $"[{DateTime.Now}] Thread Exception: {error}\n");
                    MessageBox.Show(error, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                };
                
                AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
                {
                    string error = $"Unhandled Exception: {e.ExceptionObject.ToString()}";
                    File.AppendAllText(logPath, $"[{DateTime.Now}] Unhandled Exception: {error}\n");
                    MessageBox.Show(error, "Critical Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                };
                
                Console.WriteLine($"Starting Windows 11 Scanner with Session ID: {sessionId}");
                File.AppendAllText(logPath, $"[{DateTime.Now}] About to create MainForm\n");
                
                // Create and show the main form
                var mainForm = new MainForm(sessionId);
                File.AppendAllText(logPath, $"[{DateTime.Now}] MainForm created successfully\n");
                
                // Make sure the form is visible
                mainForm.WindowState = FormWindowState.Normal;
                mainForm.ShowInTaskbar = true;
                mainForm.TopMost = true;
                mainForm.Show();
                mainForm.BringToFront();
                mainForm.Activate();
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Form visibility set, starting message loop\n");
                
                Application.Run(mainForm);
                
                File.AppendAllText(logPath, $"[{DateTime.Now}] Application.Run completed\n");
            }
            catch (Exception ex)
            {
                string criticalError = $"Critical Error: {ex.Message}\n\nDetails: {ex.ToString()}";
                
                try
                {
                    File.AppendAllText(logPath, $"[{DateTime.Now}] CRITICAL ERROR: {criticalError}\n");
                }
                catch { }
                
                MessageBox.Show($"{criticalError}\n\nA log file has been created on your desktop: Win11Scanner_Log.txt", 
                    "Critical Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
