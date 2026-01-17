import * as cp from 'child_process';
import chalk from 'chalk';

/**
 * Core logic for updating the package.
 * dependency injection allows for easy testing.
 */
export async function runUpdate(spawnFn: typeof cp.spawn) {
  console.log(chalk.blue('Checking for updates and installing...'));
  console.log(chalk.dim('Running: npm install -g @zimezone/z-command@latest'));
  
  const child = spawnFn('npm', ['install', '-g', '@zimezone/z-command@latest'], {
    stdio: 'inherit',
    shell: true
  });
  
  await new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ Update successful!'));
        console.log(chalk.dim('Please restart your terminal to use the new version.'));
        resolve();
      } else {
        console.error(chalk.red(`❌ Update failed with code ${code}.`));
        console.error(chalk.yellow('Please try running manually:'));
        console.error(chalk.cyan('npm install -g @zimezone/z-command'));
        // We reject here to allow caller to handle failure (e.g. exit process)
        reject(new Error(`Update process exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      console.error(chalk.red('❌ Failed to start update process.'));
      console.error(err);
      reject(err);
    });
  });
}

/**
 * CLI Entry point for update command
 */
export async function updateCommand() {
  try {
    await runUpdate(cp.spawn);
  } catch (error) {
    // Exit with error code if update failed
    process.exit(1);
  }
}
