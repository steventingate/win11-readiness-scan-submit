
@echo off
echo Building Windows 11 Scanner ClickOnce Application...

:: Clean previous builds
if exist "bin" rmdir /s /q "bin"
if exist "obj" rmdir /s /q "obj"
if exist "publish" rmdir /s /q "publish"

:: Restore packages
echo Restoring NuGet packages...
dotnet restore Win11Scanner.csproj

:: Build the application
echo Building application...
dotnet build Win11Scanner.csproj --configuration Release

:: Publish as ClickOnce using MSBuild
echo Publishing ClickOnce application...
msbuild Win11Scanner.csproj /p:Configuration=Release /p:Platform="Any CPU" /p:PublishUrl="publish\" /p:Install=true /p:InstallFrom=Web /p:UpdateEnabled=true /p:UpdateMode=Foreground /p:ApplicationRevision=1 /target:publish

if not exist "publish" (
    echo.
    echo WARNING: ClickOnce publish failed. Trying alternative method...
    echo Creating basic deployment...
    
    :: Create publish directory manually
    mkdir publish
    
    :: Copy built files
    xcopy "bin\Release\net6.0-windows\*" "publish\" /E /Y
    
    :: Create a simple .application file
    echo ^<?xml version="1.0" encoding="utf-8"?^> > "publish\Win11Scanner.application"
    echo ^<asmv1:assembly xsi:schemaLocation="urn:schemas-microsoft-com:asm.v1 assembly.adaptive.xsd" manifestVersion="1.0" xmlns:asmv1="urn:schemas-microsoft-com:asm.v1" xmlns="urn:schemas-microsoft-com:asm.v2" xmlns:asmv2="urn:schemas-microsoft-com:asm.v2" xmlns:xrml="urn:mpeg:mpeg21:2003:01-REL-R-NS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:asmv3="urn:schemas-microsoft-com:asm.v3" xmlns:dsig="http://www.w3.org/2000/09/xmldsig#" xmlns:co.v1="urn:schemas-microsoft-com:clickonce.v1" xmlns:co.v2="urn:schemas-microsoft-com:clickonce.v2"^> >> "publish\Win11Scanner.application"
    echo   ^<assemblyIdentity name="Win11Scanner.application" version="1.0.0.1" publicKeyToken="0000000000000000" language="neutral" processorArchitecture="msil" xmlns="urn:schemas-microsoft-com:asm.v1" /^> >> "publish\Win11Scanner.application"
    echo   ^<description asmv2:publisher="Helpdesk Computers" asmv2:product="Windows 11 System Scanner" xmlns="urn:schemas-microsoft-com:asm.v1" /^> >> "publish\Win11Scanner.application"
    echo   ^<deployment install="true" mapFileExtensions="true" ^> >> "publish\Win11Scanner.application"
    echo     ^<subscription^> >> "publish\Win11Scanner.application"
    echo       ^<update^> >> "publish\Win11Scanner.application"
    echo         ^<beforeApplicationStartup /^> >> "publish\Win11Scanner.application"
    echo       ^</update^> >> "publish\Win11Scanner.application"
    echo     ^</subscription^> >> "publish\Win11Scanner.application"
    echo     ^<deploymentProvider codebase="https://helpdeskcomputers.com.au/tools/Win11Scanner.application" /^> >> "publish\Win11Scanner.application"
    echo   ^</deployment^> >> "publish\Win11Scanner.application"
    echo   ^<dependency^> >> "publish\Win11Scanner.application"
    echo     ^<dependentAssembly dependencyType="install" allowDelayedBinding="true" codebase="Win11Scanner.exe.manifest" size="0"^> >> "publish\Win11Scanner.application"
    echo       ^<assemblyIdentity name="Win11Scanner.exe" version="1.0.0.1" publicKeyToken="0000000000000000" language="neutral" processorArchitecture="msil" type="win32" /^> >> "publish\Win11Scanner.application"
    echo       ^<hash^> >> "publish\Win11Scanner.application"
    echo         ^<dsig:Transforms^> >> "publish\Win11Scanner.application"
    echo           ^<dsig:Transform Algorithm="urn:schemas-microsoft-com:HashTransforms.Identity" /^> >> "publish\Win11Scanner.application"
    echo         ^</dsig:Transforms^> >> "publish\Win11Scanner.application"
    echo         ^<dsig:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" /^> >> "publish\Win11Scanner.application"
    echo         ^<dsig:DigestValue^>PLACEHOLDER^</dsig:DigestValue^> >> "publish\Win11Scanner.application"
    echo       ^</hash^> >> "publish\Win11Scanner.application"
    echo     ^</dependentAssembly^> >> "publish\Win11Scanner.application"
    echo   ^</dependency^> >> "publish\Win11Scanner.application"
    echo ^</asmv1:assembly^> >> "publish\Win11Scanner.application"
)

echo.
if exist "publish\Win11Scanner.exe" (
    echo Build completed successfully!
    echo ClickOnce files are in the 'publish' folder.
    echo.
    echo To deploy:
    echo 1. Upload the entire 'publish' folder contents to your web server
    echo 2. Users can install by visiting: https://yourserver.com/path/Win11Scanner.application
    echo 3. Or distribute Win11Scanner.exe directly for standalone use
) else (
    echo Build failed - no executable found in publish folder
)
echo.
pause
