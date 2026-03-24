@echo off
echo ========================================
echo Cleaning Maven Cache and Rebuilding
echo ========================================
echo.

cd /d E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms

echo [1/2] Cleaning previous build...
call mvnw.cmd clean

echo.
echo [2/2] Compiling fresh build...
call mvnw.cmd compile -DskipTests

echo.
echo ========================================
echo Build Complete! Now you can run server.
echo Run: .\run-server.bat
echo ========================================
pause
