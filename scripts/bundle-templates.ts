import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import chalk from 'chalk';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const OUTPUT_ZIP = path.join(__dirname, '..', 'templates.zip');

async function bundleTemplates() {
  console.log(chalk.cyan('📦 Bundling templates...'));

  if (!await fs.pathExists(TEMPLATES_DIR)) {
    console.error(chalk.red('❌ Templates directory not found!'));
    process.exit(1);
  }

  // Create write stream
  const output = fs.createWriteStream(OUTPUT_ZIP);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen for all archive data to be written
  output.on('close', function() {
    const size = archive.pointer();
    console.log(chalk.green(`✅ Templates bundled successfully!`));
    console.log(chalk.dim(`   Size: ${(size / 1024).toFixed(2)} KB`));
    console.log(chalk.dim(`   Path: ${OUTPUT_ZIP}`));
  });

  // Good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(chalk.yellow(err));
    } else {
      // throw error
      throw err;
    }
  });

  // Good practice to catch this error explicitly
  archive.on('error', function(err) {
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Append files from a sub-directory, putting its contents into 'templates' folder in archive
  archive.directory(TEMPLATES_DIR, 'templates');

  // Finalize the archive (ie we are done appending files but streams have to finish yet)
  await archive.finalize();
}

bundleTemplates().catch(err => {
  console.error(chalk.red('❌ Error bundling templates:'), err);
  process.exit(1);
});
