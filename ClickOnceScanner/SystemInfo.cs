
namespace Win11Scanner
{
    public class SystemInfo
    {
        public string SessionId { get; set; } = string.Empty;
        public string Processor { get; set; } = string.Empty;
        public int RamGb { get; set; }
        public int StorageGb { get; set; }
        public string Manufacturer { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public bool UefiCapable { get; set; }
        public string TmpVersion { get; set; } = string.Empty;
        public bool SecureBootCapable { get; set; }
        public string DirectxVersion { get; set; } = string.Empty;
        public string DisplayResolution { get; set; } = string.Empty;
        public bool InternetConnection { get; set; }
    }
}
