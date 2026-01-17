import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';

const SOURCES_FILE = path.join(__dirname, '../repository-sources.json');

async function main() {
  if (!await fs.pathExists(SOURCES_FILE)) {
    console.error('repository-sources not found');
    process.exit(1);
  }

  const { sources } = await fs.readJson(SOURCES_FILE);
  console.log(chalk.blue('Checking for upstream updates...'));

  for (const key of Object.keys(sources)) {
    const source = sources[key];
    const { repository, branch, lastCommit } = source;
    
    console.log(chalk.cyan(`\nChecking ${key} (${repository})...`));
    
    try {
      const url = `https://api.github.com/repos/${repository}/commits/${branch}`;
      const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'z-command-maintainer-tool' }
      });
      
      const latestSha = data.sha;
      const latestDate = data.commit.committer.date;

      console.log(`  Local Last Sync: ${lastCommit ? lastCommit.substring(0, 7) : 'None'}`);
      console.log(`  Remote Latest:   ${latestSha.substring(0, 7)} (${latestDate})`);

      if (lastCommit !== latestSha) {
          console.log(chalk.yellow('  ⚠ New commits available!'));
          console.log(chalk.dim(`  https://github.com/${repository}/commits/${branch}`));
      } else {
          console.log(chalk.green('  ✓ Up to date'));
      }

    } catch (err: any) {
       console.error(chalk.red(`  Error: ${err.message}`));
       if (err.response?.status === 404) {
           console.error(chalk.dim('  Repo or branch not found.'));
       } else if (err.response?.status === 403) {
           console.error(chalk.dim('  Rate limit exceeded?'));
       }
    }
  }
}

main().catch(console.error);
