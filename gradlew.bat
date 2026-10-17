@rem Root delegating Gradle wrapper script for Windows
@if "%DEBUG%" == "" @echo off
set SCRIPT_DIR=%~dp0
if exist "%SCRIPT_DIR%android\gradlew.bat" (
    call "%SCRIPT_DIR%android\gradlew.bat" -p "%SCRIPT_DIR%android" %*
) else (
    echo Error: android\gradlew.bat not found.
    exit /b 1
)
