@echo off
SET JAVA_HOME=C:\Program Files\Java\jdk-21
SET PATH=%JAVA_HOME%\bin;%PATH%
SET BE_DIR=c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee\code_BE
SET WRAPPER_JAR=%BE_DIR%\.mvn\wrapper\maven-wrapper.jar
SET JAVA="%JAVA_HOME%\bin\java.exe"

echo ============================================================
echo  Spring Boot Backend Launcher
echo  Java: %JAVA_HOME%
echo ============================================================

cd /d "%BE_DIR%"

:: Check if Maven is on PATH
where mvn >nul 2>&1
IF %ERRORLEVEL%==0 (
    echo [OK] Maven found on PATH. Starting...
    mvn spring-boot:run
    GOTO :done
)

:: Download maven-wrapper.jar if missing
IF NOT EXIST "%WRAPPER_JAR%" (
    echo Downloading maven-wrapper.jar from Maven Central...
    mkdir "%BE_DIR%\.mvn\wrapper" 2>nul
    %JAVA% -cp . GetWrapper.java "%WRAPPER_JAR%" 2>nul
    @IF NOT EXIST "%WRAPPER_JAR%" (
        powershell -Command "$p='SilentlyContinue'; $ProgressPreference=$p; Invoke-WebRequest 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%WRAPPER_JAR%'"
    )
)

:: Try running with mvnw
IF EXIST "%WRAPPER_JAR%" (
    echo [OK] Running with Maven Wrapper...
    call "%BE_DIR%\mvnw.cmd" spring-boot:run
) ELSE (
    echo.
    echo *** Maven could not be set up automatically ***
    echo.
    echo Please install Maven manually, then run:
    echo   cd code_BE
    echo   mvn spring-boot:run
    echo.
    echo Maven download: https://maven.apache.org/download.cgi
)

:done
pause
