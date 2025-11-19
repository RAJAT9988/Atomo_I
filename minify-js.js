const Terser = require('terser');
const fs = require('fs-extra');
const glob = require('glob');

const jsFiles = glob.sync('**/*.js', {
  ignore: ['node_modules/**', 'dist/**', 'minify-js.js', 'minify-css.js', 'update-js-version.js', 'update-css-version.js'] // ignore these folders and scripts
});

if (jsFiles.length === 0) {
  console.log('No JS files found to minify.');
  process.exit(0);
}

console.log(`Found ${jsFiles.length} JS files. Minifying...`);

jsFiles.forEach(async (file) => {
  try {
    const code = fs.readFileSync(file, 'utf-8');
    const minified = await Terser.minify(code);

    if (minified.error) {
      console.error(`Error minifying ${file}:`, minified.error);
      return;
    }

    fs.writeFileSync(file, minified.code);
    console.log(`Minified: ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});

console.log('✅ All JS files have been minified successfully!');

//node minify-js.js -- to run the script
