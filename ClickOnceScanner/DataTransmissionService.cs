
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
        private const string SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZGlpZHh5cGRhZHFzcGFmdmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTQxMDcsImV4cCI6MjA2NTM3MDEwN30.w61wrEcAZAcxq3qYzaFFL6sX1aL2H5NaUdsJk0XTWJI";

        public event Action<string> LogMessage;

        public DataTransmissionService()
        {
            httpClient = new HttpClient();
            // Add required Supabase headers
            httpClient.DefaultRequestHeaders.Add("apikey", SUPABASE_ANON_KEY);
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {SUPABASE_ANON_KEY}");
        }

        public async Task SendDataToServerAsync(SystemInfo systemInfo)
        {
            try
            {
                LogMessage?.Invoke("Preparing to send data to server...");
                
                var json = JsonSerializer.Serialize(systemInfo, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                LogMessage?.Invoke($"Sending JSON: {json}");

                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                LogMessage?.Invoke($"Posting to: {SUPABASE_URL}");
                var response = await httpClient.PostAsync(SUPABASE_URL, content);

                LogMessage?.Invoke($"Response status: {response.StatusCode}");
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    LogMessage?.Invoke($"Success! Response: {responseContent}");
                    LogMessage?.Invoke("Data successfully sent to compatibility checker!");
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    LogMessage?.Invoke($"Error response body: {errorContent}");
                    throw new Exception($"Server responded with: {response.StatusCode} - {errorContent}");
                }
            }
            catch (HttpRequestException httpEx)
            {
                LogMessage?.Invoke($"Network error: {httpEx.Message}");
                throw new Exception($"Network error sending data to server: {httpEx.Message}");
            }
            catch (Exception ex)
            {
                LogMessage?.Invoke($"General error: {ex.Message}");
                throw new Exception($"Error sending data to server: {ex.Message}");
            }
        }

        public void Dispose()
        {
            httpClient?.Dispose();
        }
    }
}
