
using System;
using System.Windows.Forms;

namespace Win11Scanner
{
    internal static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                
                // Get session ID from command line or generate one
                string sessionId = args.Length > 0 ? args[0] : Guid.NewGuid().ToString();
                
                // Add global exception handler
                Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
                Application.ThreadException += (sender, e) =>
                {
                    MessageBox.Show($"Application Error: {e.Exception.Message}\n\nDetails: {e.Exception.ToString()}", 
                        "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                };
                
                Console.WriteLine($"Starting Windows 11 Scanner with Session ID: {sessionId}");
                
                Application.Run(new MainForm(sessionId));
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Critical Error: {ex.Message}\n\nDetails: {ex.ToString()}", 
                    "Critical Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
