
@echo off
echo Building Win11Scanner with debug output...

cd /d "%~dp0"

echo Cleaning previous builds...
if exist bin rmdir /s /q bin
if exist obj rmdir /s /q obj

echo Building application...
dotnet clean
dotnet build --configuration Release

echo Publishing self-contained executable...
dotnet publish --configuration Release --runtime win-x64 --self-contained true --output "../public/clickonce/win-x64"

echo Build complete! Check the public/clickonce/win-x64 folder for Win11Scanner.exe

pause
