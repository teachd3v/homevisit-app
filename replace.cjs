const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const files = walk('src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // React component and File names
  content = content.replace(/DataInterviewer/g, 'DataVisitor');
  content = content.replace(/JadwalWawancara/g, 'JadwalHomeVisit');
  content = content.replace(/InterviewerDashboard/g, 'VisitorDashboard');
  content = content.replace(/InterviewerSelectPage/g, 'VisitorSelectPage');

  // Specific path / url strings
  content = content.replace(/\/admin\/interviewer/g, '/admin/visitor');
  content = content.replace(/\/interviewer/g, '/visitor');
  content = content.replace(/pages\/interviewer/g, 'pages/visitor');
  
  // Store renaming
  content = content.replace(/interviewerStore/g, 'visitorStore');
  content = content.replace(/useInterviewerStore/g, 'useVisitorStore');
  content = content.replace(/InterviewerStore/g, 'VisitorStore');
  
  // Data models and variables
  content = content.replace(/Interviewer/g, 'Visitor');
  content = content.replace(/interviewer/g, 'visitor');
  content = content.replace(/interviewers/g, 'visitors');
  content = content.replace(/Interviewers/g, 'Visitors');

  // Wawancara phrasing
  content = content.replace(/Jadwal Wawancara/g, 'Jadwal Home Visit');
  content = content.replace(/jadwal wawancara/g, 'jadwal home visit');
  content = content.replace(/Wawancara/g, 'HomeVisit');
  content = content.replace(/wawancara/g, 'home_visit');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
