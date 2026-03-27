@echo off
REM Script to create NextJS project structure

echo Creating directory structure...

mkdir app 2>nul
mkdir app\(auth) 2>nul
mkdir app\(auth)\login 2>nul
mkdir app\(auth)\register 2>nul
mkdir app\(dashboard) 2>nul
mkdir app\(dashboard)\dashboard 2>nul
mkdir app\(dashboard)\settings 2>nul
mkdir app\(dashboard)\student 2>nul
mkdir app\(dashboard)\student\courses 2>nul
mkdir app\(dashboard)\student\exams 2>nul
mkdir app\(dashboard)\student\certificates 2>nul
mkdir app\(dashboard)\instructor 2>nul
mkdir app\(dashboard)\instructor\courses 2>nul
mkdir app\(dashboard)\instructor\questions 2>nul
mkdir app\(dashboard)\instructor\exams 2>nul
mkdir app\(dashboard)\instructor\grading 2>nul
mkdir app\(dashboard)\instructor\students 2>nul
mkdir app\(dashboard)\admin 2>nul
mkdir app\(dashboard)\admin\users 2>nul
mkdir app\(dashboard)\admin\instructor-requests 2>nul
mkdir app\(dashboard)\admin\analytics 2>nul
mkdir app\(dashboard)\discussions 2>nul

mkdir components 2>nul
mkdir components\ui 2>nul
mkdir components\auth 2>nul
mkdir components\course 2>nul
mkdir components\exam 2>nul
mkdir components\common 2>nul
mkdir components\layouts 2>nul

mkdir lib 2>nul
mkdir services 2>nul
mkdir hooks 2>nul
mkdir types 2>nul
mkdir store 2>nul
mkdir utils 2>nul

echo Directory structure created successfully!
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Create component files
echo 3. Setup authentication