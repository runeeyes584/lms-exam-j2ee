@echo off
REM Script to create NextJS project structure

echo Creating directory structure...

mkdir app
mkdir app\(auth)
mkdir app\(auth)\login
mkdir app\(auth)\register
mkdir app\(dashboard)
mkdir app\(dashboard)\dashboard
mkdir app\(dashboard)\courses
mkdir app\(dashboard)\exams

mkdir components
mkdir components\ui
mkdir components\auth
mkdir components\course
mkdir components\exam
mkdir components\common

mkdir lib
mkdir services
mkdir hooks
mkdir types
mkdir store
mkdir utils

echo Directory structure created successfully!
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Create component files
echo 3. Setup authentication

pause