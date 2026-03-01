@echo off
SET MONGOD="C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
mkdir C:\data\db 2>nul
echo Starting MongoDB on port 27017...
%MONGOD% --dbpath C:\data\db
pause
