import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

interface ListOptions {
  skills?: boolean;
  agents?: boolean;
}

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

export async function listCommand(options: ListOptions): Promise<void> {
  console.log(chalk.cyan('\n📋 Available Templates\n'));

  const listSkills = !options.agents || options.skills;
  const listAgents = !options.skills || options.agents;

  if (listSkills) {
    await listSkillsTemplates();
  }

  if (listAgents) {
    await listAgentsTemplates();
  }
}

async function listSkillsTemplates(): Promise<void> {
  const skillsDir = path.join(TEMPLATES_DIR, 'skills');

  if (!await fs.pathExists(skillsDir)) {
    console.log(chalk.yellow('No skills found\n'));
    return;
  }

  console.log(chalk.bold('Skills:'));
  const skills = await fs.readdir(skillsDir);

  for (const skill of skills) {
    const skillPath = path.join(skillsDir, skill);
    const stat = await fs.stat(skillPath);
    if (stat.isDirectory()) {
      const skillMd = path.join(skillPath, 'SKILL.md');
      if (await fs.pathExists(skillMd)) {
        const content = await fs.readFile(skillMd, 'utf-8');
        const description = extractDescription(content);
        console.log(chalk.green(`  • ${skill}`) + chalk.dim(` - ${description}`));
      }
    }
  }
  console.log();
}

async function listAgentsTemplates(): Promise<void> {
  const agentsDir = path.join(TEMPLATES_DIR, 'agents');

  if (!await fs.pathExists(agentsDir)) {
    console.log(chalk.yellow('No agents found\n'));
    return;
  }

  console.log(chalk.bold('Agents:'));
  const agents = await fs.readdir(agentsDir);

  for (const agent of agents) {
    if (agent.endsWith('.agent.md')) {
      const agentPath = path.join(agentsDir, agent);
      const content = await fs.readFile(agentPath, 'utf-8');
      const description = extractDescription(content);
      const name = agent.replace('.agent.md', '');
      console.log(chalk.green(`  • ${name}`) + chalk.dim(` - ${description}`));
    }
  }
  console.log();
}

function extractDescription(content: string): string {
  const match = content.match(/description:\s*(.+)/i);
  if (match) {
    return match[1].trim().substring(0, 60);
  }
  return 'No description';
}
