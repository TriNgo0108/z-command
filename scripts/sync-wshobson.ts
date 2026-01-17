import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import os from 'os';

const REPO_URL = 'https://github.com/wshobson/agents.git';
const TEMP_DIR = path.join(os.tmpdir(), 'z-command-wshobson-sync');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const AGENTS_DIR = path.join(TEMPLATES_DIR, 'agents');
const SKILLS_DIR = path.join(TEMPLATES_DIR, 'skills');

async function main() {
  console.log(chalk.cyan('🔄 Syncing wshobson/agents...'));

  // 1. Setup Temp Dir
  if (await fs.pathExists(TEMP_DIR)) {
    await fs.remove(TEMP_DIR);
  }
  await fs.ensureDir(TEMP_DIR);

  // 2. Clone Repo
  console.log(chalk.blue(`📦 Cloning ${REPO_URL}...`));
  try {
    execSync(`git clone ${REPO_URL} .`, { stdio: 'inherit', cwd: TEMP_DIR });
  } catch (err) {
    console.error(chalk.red('Failed to clone repository.'));
    process.exit(1);
  }

  // 3. Process Plugins
  const pluginsDir = path.join(TEMP_DIR, 'plugins');
  if (!await fs.pathExists(pluginsDir)) {
    console.error(chalk.red('Plugins directory not found!'));
    process.exit(1);
  }

  const plugins = await fs.readdir(pluginsDir);
  let agentsAdded = 0;
  let skillsAdded = 0;

  for (const plugin of plugins) {
    const pluginPath = path.join(pluginsDir, plugin);
    if (!(await fs.stat(pluginPath)).isDirectory()) continue;

    // Process Agents
    const sourceAgentsDir = path.join(pluginPath, 'agents');
    if (await fs.pathExists(sourceAgentsDir)) {
      const agents = await fs.readdir(sourceAgentsDir);
      for (const agentFile of agents) {
        if (!agentFile.endsWith('.md')) continue;

        const sourceFile = path.join(sourceAgentsDir, agentFile);
        
        // Handle naming: ensure .agent.md extension
        let targetName = agentFile;
        if (!targetName.endsWith('.agent.md')) {
            targetName = targetName.replace('.md', '.agent.md');
        }

        const targetFile = path.join(AGENTS_DIR, targetName);

        // Skip if exists
        if (await fs.pathExists(targetFile)) {
            // Check if conflict
             // Smart collision handling: fallback to prefix if contents differ?
             // User said: "simple as possible" and "only get files which our package does not contain".
             // Strict interpretation: If file exists, SKIP.
            // console.log(chalk.gray(`  Skipping existing agent: ${targetName}`));
            continue; 
        } else {
             // Second check: What if multiple plugins have same agent name?
             // We can't check targetFile existence alone because we might have just written it from another plugin.
             // But since we write directly to target, the second one will hit the "exists" check and skip.
             // This effectively means "First come, first served".
             
             await fs.copy(sourceFile, targetFile);
             console.log(chalk.green(`  + Agent: ${targetName}`));
             agentsAdded++;
        }
      }
    }

    // Process Skills
    const sourceSkillsDir = path.join(pluginPath, 'skills');
    if (await fs.pathExists(sourceSkillsDir)) {
      const skills = await fs.readdir(sourceSkillsDir);
      for (const skillDir of skills) {
        const sourceSkill = path.join(sourceSkillsDir, skillDir);
        if (!(await fs.stat(sourceSkill)).isDirectory()) continue;

        const targetSkill = path.join(SKILLS_DIR, skillDir);

        if (await fs.pathExists(targetSkill)) {
            // console.log(chalk.gray(`  Skipping existing skill: ${skillDir}`));
            continue;
        }

        await fs.copy(sourceSkill, targetSkill);
        console.log(chalk.green(`  + Skill: ${skillDir}`));
        skillsAdded++;
      }
    }
  }

  // 4. Cleanup
  await fs.remove(TEMP_DIR);

  console.log(chalk.cyan(`\n✅ Sync Complete!`));
  console.log(chalk.dim(`  Agents added: ${agentsAdded}`));
  console.log(chalk.dim(`  Skills added: ${skillsAdded}`));
}

main().catch(console.error);
