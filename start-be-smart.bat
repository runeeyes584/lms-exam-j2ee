@echo off
SETLOCAL EnableDelayedExpansion

echo ========================================
echo  LMS Exam - Backend Smart Launcher
echo ========================================

SET "JAVA_HOME=C:\Program Files\Java\jdk-21"
IF NOT EXIST "%JAVA_HOME%\bin\java.exe" (
    echo [ERROR] Java 21 not found at %JAVA_HOME%
    pause
    exit /b 1
)
SET "PATH=%JAVA_HOME%\bin;%PATH%"
echo [OK] Java 21 found.

echo.
echo Searching for Maven on C: drive... (this might take a few seconds)
SET "FOUND_MVN="

:: Search common user mistake locations first for speed
FOR /D %%D IN ("C:\maven\*" "C:\maven\apache-maven*\*" "C:\Users\%USERNAME%\Downloads\apache-maven*\*") DO (
    IF EXIST "%%~fD\bin\mvn.cmd" (
        SET "FOUND_MVN=%%~fD"
        GOTO :found_maven
    )
    IF EXIST "%%~fD\mvn.cmd" (
        SET "FOUND_MVN=%%~dpD"
        GOTO :found_maven
    )
)

:: If not found in quick spots, do a deep search in C:\maven
IF EXIST "C:\maven" (
    FOR /F "delims=" %%F IN ('dir /b /s "C:\maven\mvn.cmd" 2^>nul') DO (
        SET "FOUND_MVN=%%~dpF"
        SET "FOUND_MVN=!FOUND_MVN:\bin\=!"
        GOTO :found_maven
    )
)

:found_maven
IF NOT "!FOUND_MVN!"=="" (
    echo [OK] Found Maven at: !FOUND_MVN!
    SET "PATH=!FOUND_MVN!\bin;%PATH%"
    
    echo.
    echo Starting Spring Boot Backend...
    cd /d "c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee\code_BE"
    mvn spring-boot:run
) ELSE (
    echo.
    echo [ERROR] Could not find 'mvn.cmd' anywhere inside C:\maven!
    echo.
    echo Did you extract the zip file? 
    echo Please make sure you extracted it so there is a 'bin' folder with 'mvn.cmd' inside.
)

pause
