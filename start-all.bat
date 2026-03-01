@echo off
SET JAVA_HOME=C:\Program Files\Java\jdk-21
SET PATH=%JAVA_HOME%\bin;%PATH%
SET MONGOD="C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
SET ROOT=c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee
SET MAVEN_LOCAL=%ROOT%\maven\apache-maven-3.9.9\bin\mvn.cmd
SET DATA_DIR=c:\data\db

echo ============================================================
echo  LMS Exam - Full Stack Startup
echo  Java: %JAVA_HOME%
echo  MongoDB: %MONGOD%
echo ============================================================

:: 1. Create MongoDB data dir
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

:: 2. Start MongoDB in a new window
echo [1/3] Starting MongoDB on port 27017...
start "MongoDB :27017" %MONGOD% --dbpath "%DATA_DIR%"
timeout /t 3 /nobreak >nul

:: 3. Start Frontend
echo [2/3] Starting Next.js Frontend on port 3000...
start "Frontend :3000" cmd /K "cd /d %ROOT%\code_FE && npm run dev"
timeout /t 2 /nobreak >nul

:: 4. Download Maven if not present
IF NOT EXIST "%MAVEN_LOCAL%" (
    echo.
    echo [3/3] Maven not found locally. Downloading Maven 3.9.9...
    powershell -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest 'https://downloads.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip' -OutFile '%ROOT%\maven.zip'; Expand-Archive -Path '%ROOT%\maven.zip' -DestinationPath '%ROOT%\maven' -Force; Remove-Item '%ROOT%\maven.zip'"
    echo Download complete!
)

:: 5. Start Backend
echo [3/3] Starting Spring Boot Backend on port 8080...
IF EXIST "%MAVEN_LOCAL%" (
    start "Backend :8080" cmd /K "SET JAVA_HOME=%JAVA_HOME% && cd /d %ROOT%\code_BE && %MAVEN_LOCAL% spring-boot:run"
) ELSE (
    where mvn >nul 2>&1
    IF %ERRORLEVEL%==0 (
        start "Backend :8080" cmd /K "SET JAVA_HOME=%JAVA_HOME% && cd /d %ROOT%\code_BE && mvn spring-boot:run"
    ) ELSE (
        echo.
        echo *** ERROR: Maven is required but not found! ***
        echo Please install Maven from: https://maven.apache.org/download.cgi
        echo Then run this script again.
        pause
        exit /b 1
    )
)

echo.
echo ============================================================
echo  All services started!
echo   - MongoDB:  mongodb://localhost:27017
echo   - Frontend: http://localhost:3000/courses
echo   - Backend:  http://localhost:8080/api/v1
echo ============================================================
echo  Check the opened windows for logs.
pause
