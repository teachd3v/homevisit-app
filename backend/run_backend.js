const { spawn } = require('child_process');
const cp = spawn('npx.cmd', ['ts-node', 'src/index.ts'], { stdio: 'inherit' });
cp.on('close', (code) => console.log('Process exited with code', code));
