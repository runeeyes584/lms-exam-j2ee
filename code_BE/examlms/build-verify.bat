@echo off
REM Maven Build Script for LMS Exam Project
REM Created: 2026-03-24

echo ========================================
echo LMS Exam J2EE - Maven Build Script
echo ========================================
echo.

cd /d E:\A.PRJ\J2EEDA\lms-exam-j2ee\code_BE\examlms

echo [1/3] Cleaning previous build...
call mvnw.cmd clean

echo.
echo [2/3] Compiling project (skip tests)...
call mvnw.cmd compile -DskipTests

echo.
echo [3/3] Resolving dependencies...
call mvnw.cmd dependency:resolve

echo.
echo ========================================
echo Build Complete!
echo ========================================
pause
