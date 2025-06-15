
using System;
using System.Windows.Forms;

namespace Win11Scanner
{
    internal static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Get session ID from command line or generate one
            string sessionId = args.Length > 0 ? args[0] : Guid.NewGuid().ToString();
            
            Application.Run(new MainForm(sessionId));
        }
    }
}
