
@echo off
echo Building Win11Scanner with authentication fix...

cd /d "%~dp0"

echo Cleaning previous builds...
if exist bin rmdir /s /q bin
if exist obj rmdir /s /q obj

echo Restoring packages...
dotnet restore

echo Building application...
dotnet clean
dotnet build --configuration Release --verbosity minimal

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check the error messages above.
    pause
    exit /b 1
)

echo Publishing self-contained executable...
dotnet publish --configuration Release --runtime win-x64 --self-contained true --output "../public/clickonce/win-x64" --verbosity minimal

if %ERRORLEVEL% NEQ 0 (
    echo Publish failed! Check the error messages above.
    pause
    exit /b 1
)

echo Build successful! 
echo The updated Win11Scanner.exe is now in the public/clickonce/win-x64 folder
echo It now includes proper Supabase authentication headers.

pause
