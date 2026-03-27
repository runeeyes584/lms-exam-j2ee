const fs = require('fs');
const path = require('path');

const dirs = [
  'settings',
  'student/courses',
  'student/exams', 
  'student/certificates',
  'instructor/courses',
  'instructor/questions',
  'instructor/exams',
  'instructor/grading',
  'instructor/students',
  'admin/users',
  'admin/instructor-requests',
  'admin/analytics',
  'discussions'
];

const base = path.join(__dirname, 'code_FE/app/(dashboard)');

dirs.forEach(d => {
  const full = path.join(base, d);
  fs.mkdirSync(full, { recursive: true });
  console.log('Created:', full);
});

console.log('Done!');
