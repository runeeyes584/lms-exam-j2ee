@echo off
echo ========================================
echo  LMS Exam - Push to GitHub
echo ========================================
cd /d c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee

echo Checking out feature/courses branch...
git checkout -b feature/courses 2>nul
git checkout feature/courses

echo.
echo Adding files...
git add .

echo.
echo Committing changes...
git commit -m "feat: implement Course Master module (CRUD, Curriculum Builder, Media Resources)"

echo.
echo Pushing to GitHub...
::: This will trigger the GitHub login popup if needed
git push -u origin feature/courses

echo.
echo Done! Please check your GitHub repository.
pause
