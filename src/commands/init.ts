import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import os from 'os';

interface InitOptions {
  skills?: boolean;
  agents?: boolean;
  global?: boolean;
  category?: string;
}

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.cyan('\n🚀 Z-Command - Installing GitHub Copilot Skills & Agents\n'));

  const targetBase = options.global
    ? path.join(os.homedir(), '.copilot')
    : path.join(process.cwd(), '.github');

  const installSkills = !options.agents || options.skills;
  const installAgents = !options.skills || options.agents;

  let skillsCount = 0;
  let agentsCount = 0;

  // Install skills
  if (installSkills) {
    skillsCount = await copySkills(targetBase, options.category);
  }

  // Install agents
  if (installAgents) {
    agentsCount = await copyAgents(targetBase, options.category);
  }

  console.log(chalk.green('\n✅ Installation complete!'));
  console.log(chalk.dim(`   Skills: ${skillsCount}`));
  console.log(chalk.dim(`   Agents: ${agentsCount}`));
  console.log(chalk.dim(`   Location: ${targetBase}\n`));
}

async function copySkills(targetBase: string, category?: string): Promise<number> {
  const skillsSource = path.join(TEMPLATES_DIR, 'skills');
  const skillsTarget = path.join(targetBase, 'skills');

  if (!await fs.pathExists(skillsSource)) {
    console.log(chalk.yellow('⚠ No skills templates found'));
    return 0;
  }

  await fs.ensureDir(skillsTarget);

  const skills = await fs.readdir(skillsSource);
  let count = 0;

  for (const skill of skills) {
    const sourcePath = path.join(skillsSource, skill);
    const targetPath = path.join(skillsTarget, skill);

    if (category && !skill.includes(category)) continue;

    const stat = await fs.stat(sourcePath);
    if (stat.isDirectory()) {
      await fs.copy(sourcePath, targetPath, { overwrite: false });
      console.log(chalk.green(`  ✓ Skill: ${skill}`));
      count++;
    }
  }

  return count;
}

async function copyAgents(targetBase: string, category?: string): Promise<number> {
  const agentsSource = path.join(TEMPLATES_DIR, 'agents');
  const agentsTarget = path.join(targetBase, 'agents');

  if (!await fs.pathExists(agentsSource)) {
    console.log(chalk.yellow('⚠ No agents templates found'));
    return 0;
  }

  await fs.ensureDir(agentsTarget);

  const agents = await fs.readdir(agentsSource);
  let count = 0;

  for (const agent of agents) {
    const sourcePath = path.join(agentsSource, agent);
    const targetPath = path.join(agentsTarget, agent);

    if (category && !agent.includes(category)) continue;

    const stat = await fs.stat(sourcePath);
    if (stat.isFile() && agent.endsWith('.agent.md')) {
      await fs.copy(sourcePath, targetPath, { overwrite: false });
      console.log(chalk.green(`  ✓ Agent: ${agent.replace('.agent.md', '')}`));
      count++;
    }
  }

  return count;
}
