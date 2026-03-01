@echo off
SETLOCAL EnableDelayedExpansion

echo ========================================
echo  LMS Exam - Backend Setup ^& Start
echo ========================================

SET "JAVA_HOME=C:\Program Files\Java\jdk-21"
SET "PATH=%JAVA_HOME%\bin;%PATH%"

SET "ROOT_DIR=c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee"
SET "MAVEN_ZIP=%ROOT_DIR%\maven.zip"
SET "MAVEN_DIR=%ROOT_DIR%\maven"
SET "MVN_CMD=%MAVEN_DIR%\apache-maven-3.9.9\bin\mvn.cmd"

IF NOT EXIST "%MVN_CMD%" (
    echo Downloading Maven 3.9.9...
    powershell -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest 'https://downloads.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip' -OutFile '%MAVEN_ZIP%'"
    
    echo Extracting Maven...
    powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIR%' -Force"
    
    del "%MAVEN_ZIP%"
    echo Maven setup complete.
) ELSE (
    echo Using existing local Maven...
)

echo.
echo Starting Spring Boot Server...
SET "PATH=%MAVEN_DIR%\apache-maven-3.9.9\bin;%PATH%"
cd /d "%ROOT_DIR%\code_BE"
mvn spring-boot:run

pause
