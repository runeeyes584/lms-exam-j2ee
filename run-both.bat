@echo off
setlocal

set "FE_DIR=E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_FE"
set "BE_DIR=E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms"

echo Starting Frontend (npm run dev)...
start "FE Dev Server" cmd /k "cd /d "%FE_DIR%" && npm run dev"

echo Starting Backend (run-server.bat)...
start "BE Spring Server" cmd /k "cd /d "%BE_DIR%" && call .\run-server.bat"

echo Both processes have been launched in separate windows.
endlocal
