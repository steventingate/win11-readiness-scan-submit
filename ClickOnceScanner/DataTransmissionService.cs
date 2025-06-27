
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Win11Scanner
{
    public class DataTransmissionService
    {
        private readonly HttpClient httpClient;
        private const string SUPABASE_URL = "https://sfdiidxypdadqspafvlc.supabase.co/functions/v1/submit-system-scan";

        public event Action<string> LogMessage;

        public DataTransmissionService()
        {
            httpClient = new HttpClient();
        }

        public async Task SendDataToServerAsync(SystemInfo systemInfo)
        {
            try
            {
                var json = JsonSerializer.Serialize(systemInfo, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(SUPABASE_URL, content);

                if (response.IsSuccessStatusCode)
                {
                    LogMessage?.Invoke("Data successfully sent to compatibility checker!");
                }
                else
                {
                    throw new Exception($"Server responded with: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke($"Error sending data to server: {ex.Message}");
                throw;
            }
        }

        public void Dispose()
        {
            httpClient?.Dispose();
        }
    }
}
