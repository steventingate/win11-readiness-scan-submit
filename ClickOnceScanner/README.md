
# Windows 11 System Scanner - ClickOnce Application

This is a C# Windows Forms application that scans system information and sends it to your web application via the Supabase backend.

## Features

- Comprehensive hardware detection (CPU, RAM, Storage)
- UEFI/BIOS detection
- TPM version detection
- Secure Boot capability check
- DirectX version detection
- Display resolution detection
- Internet connectivity check
- Automatic data submission to your web app

## Building the Application

### Prerequisites

- .NET 6.0 SDK or later
- Visual Studio 2022 (recommended) or Visual Studio Code
- Windows 10/11 for testing

### Build Instructions

1. Open a command prompt in the ClickOnceScanner folder
2. Run the build script:
   ```batch
   build-and-deploy.bat
   ```

### Manual Build

If you prefer to build manually:

```batch
# Restore packages
dotnet restore

# Build
dotnet build --configuration Release

# Publish for ClickOnce
dotnet publish --configuration Release --runtime win-x64 --self-contained false
```

## Deployment

### ClickOnce Deployment

1. Build the application using the instructions above
2. Upload the contents of the `publish` folder to your web server
3. The main application manifest will be `Win11Scanner.application`
4. Users can install by visiting: `https://yourserver.com/path/Win11Scanner.application`

### Web Integration

The application sends data to your Supabase function at:
`https://sfdiidxypdadqspafvlc.supabase.co/functions/v1/submit-system-scan`

Make sure this endpoint is configured to receive the system information.

## Usage

1. Users click the ClickOnce link from your web application
2. Windows prompts for installation (one-time)
3. Application launches and automatically scans the system
4. Results are displayed and sent to your server
5. Application closes automatically after completion

## Security Notes

- Application runs with standard user privileges (no admin required)
- All system information is gathered using standard Windows APIs
- Data is sent over HTTPS to your secure Supabase endpoint
- No sensitive information is stored locally

## Troubleshooting

- **Installation Issues**: Ensure .NET 6.0 runtime is installed on target machines
- **Permission Errors**: Application doesn't require admin rights, check Windows security settings
- **Network Issues**: Verify the Supabase endpoint URL is accessible
- **TPM Detection**: Some virtual machines may not report TPM correctly

## Customization

You can modify the `MainForm.cs` file to:
- Add additional system checks
- Change the UI appearance
- Modify the data collection logic
- Add custom branding

The application is designed to be lightweight and focused on accurate system detection for Windows 11 compatibility checking.
