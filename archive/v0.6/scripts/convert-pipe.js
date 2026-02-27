// One-time conversion script: extract PIPE_DIMENSIONS from data/pipe.js -> JSON
import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('data/pipe.js', 'utf8');

// Extract the PIPE_DIMENSIONS array literal
const match = src.match(/const PIPE_DIMENSIONS = (\[[\s\S]*\]);?\s*$/m);
if (!match) {
  // Try to eval the array directly
  console.log('Could not regex extract PIPE_DIMENSIONS, trying eval approach...');
}

// We need to eval the file to get the data since it's JavaScript, not JSON
// First, stub out the SOURCES reference
const SOURCES = { moody: 'moody' };
const evalCode = `
${src.replace(/SOURCES\.\w+/g, '"moody"')}
JSON.stringify(PIPE_DIMENSIONS, null, 2);
`;

try {
  const result = eval(evalCode);
  writeFileSync('src/data/pipe-dimensions.json', result);
  console.log('Wrote pipe-dimensions.json');
} catch (e) {
  console.error('Eval failed:', e.message);
  // Fallback: just extract with a more lenient regex
  const start = src.indexOf('const PIPE_DIMENSIONS = [');
  if (start === -1) {
    console.error('Could not find PIPE_DIMENSIONS');
    process.exit(1);
  }
  const arrayStr = src.slice(start + 'const PIPE_DIMENSIONS = '.length);
  // This is JS object literal, need to make it JSON
  // Replace single quotes, add quotes to keys, etc.
  let json = arrayStr
    .replace(/\/\/.*$/gm, '')  // remove comments
    .replace(/,(\s*[}\]])/g, '$1'); // remove trailing commas
  writeFileSync('src/data/pipe-dimensions-raw.js', 'export default ' + json);
  console.log('Wrote raw JS file for manual conversion');
}
