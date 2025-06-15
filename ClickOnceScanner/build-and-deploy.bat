
@echo off
echo Building Windows 11 Scanner ClickOnce Application...

:: Clean previous builds
if exist "bin" rmdir /s /q "bin"
if exist "obj" rmdir /s /q "obj"
if exist "publish" rmdir /s /q "publish"

:: Restore packages
echo Restoring NuGet packages...
dotnet restore

:: Build the application
echo Building application...
dotnet build --configuration Release

:: Publish as ClickOnce
echo Publishing ClickOnce application...
dotnet publish --configuration Release --runtime win-x64 --self-contained false

echo.
echo Build completed! 
echo ClickOnce files are in the 'publish' folder.
echo Upload the contents of the 'publish' folder to your web server.
echo.
pause
