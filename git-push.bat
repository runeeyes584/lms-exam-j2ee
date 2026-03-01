@echo off
echo Running Git Commands...
git checkout -b feature/courses
git add .
git commit -m "feat: implement Course Master module (CRUD, Curriculum Builder, Media Resources)"
git push -u origin feature/courses
echo Done.
pause
