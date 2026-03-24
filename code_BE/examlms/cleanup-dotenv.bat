@echo off
REM Delete DotenvConfig.java file that is no longer needed
del /F /Q "E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms\src\main\java\kaleidoscope\j2ee\examlms\config\DotenvConfig.java"

if exist "E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms\src\main\java\kaleidoscope\j2ee\examlms\config\DotenvConfig.java" (
    echo Failed to delete DotenvConfig.java
    echo Please delete it manually
    pause
) else (
    echo DotenvConfig.java deleted successfully!
    echo Now you can run: .\run-server.bat
    pause
)
