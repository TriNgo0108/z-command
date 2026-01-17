import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import os from 'os';
import { InitOptions, PlatformConfig, InstallResult } from '../types';
import { getTargetPlatforms } from '../platforms';

const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.cyan('\n🚀 Z-Command - Installing AI Coding Assistant Skills & Agents\n'));

  const platforms = getTargetPlatforms(options.target);
  const results: InstallResult[] = [];

  for (const platform of platforms) {
    console.log(chalk.blue(`\n📦 Installing for ${platform.displayName}...`));

    const result = await installForPlatform(platform, options);
    results.push(result);

    console.log(chalk.dim(`   Location: ${result.location}`));
  }

  // Summary
  console.log(chalk.green('\n✅ Installation complete!\n'));
  console.log(chalk.bold('Summary:'));

  for (const result of results) {
    console.log(chalk.cyan(`  ${result.platform}:`));
    console.log(chalk.dim(`    Skills: ${result.skillsCount}`));
    console.log(chalk.dim(`    Agents: ${result.agentsCount}`));
  }

  console.log();
}

async function installForPlatform(
  platform: PlatformConfig,
  options: InitOptions
): Promise<InstallResult> {
  const targetBase = options.global
    ? path.join(os.homedir(), platform.globalDir)
    : path.join(process.cwd(), platform.projectDir);

  const installSkills = !options.agents || options.skills;
  const installAgents = !options.skills || options.agents;

  let skillsCount = 0;
  let agentsCount = 0;

  // Install skills (if platform supports them)
  if (installSkills && platform.skillsDir) {
    skillsCount = await copySkills(targetBase, platform, options.category);
  }

  // Install agents
  if (installAgents) {
    agentsCount = await copyAgents(targetBase, platform, options.category);
  }

  return {
    platform: platform.displayName,
    skillsCount,
    agentsCount,
    location: targetBase,
  };
}

async function copySkills(
  targetBase: string,
  platform: PlatformConfig,
  category?: string
): Promise<number> {
  const skillsSource = path.join(TEMPLATES_DIR, 'skills');
  const skillsTarget = path.join(targetBase, platform.skillsDir!);

  if (!await fs.pathExists(skillsSource)) {
    console.log(chalk.yellow('  ⚠ No skills templates found'));
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
      // Copy skill directory, applying transformation if needed
      await copySkillDirectory(sourcePath, targetPath, platform);

      // Handle shared resources for complex skills (data/, scripts/)
      if (platform.sharedDir) {
        const dataSource = path.join(sourcePath, 'data');
        const scriptsSource = path.join(sourcePath, 'scripts');

        const hasData = await fs.pathExists(dataSource);
        const hasScripts = await fs.pathExists(scriptsSource);

        if (hasData || hasScripts) {
          const sharedTarget = path.join(process.cwd(), platform.sharedDir, skill);
          await fs.ensureDir(sharedTarget);

          // Copy data directory to shared location
          if (hasData) {
            await fs.copy(dataSource, path.join(sharedTarget, 'data'));
          }

          // Copy scripts directory to shared location
          if (hasScripts) {
            await fs.copy(scriptsSource, path.join(sharedTarget, 'scripts'));
          }

          console.log(chalk.dim(`      → Shared resources: ${platform.sharedDir}/${skill}/`));
        }
      }

      console.log(chalk.green(`    ✓ Skill: ${skill}`));
      count++;
    }
  }

  return count;
}

async function copySkillDirectory(
  sourcePath: string,
  targetPath: string,
  platform: PlatformConfig
): Promise<void> {
  await fs.ensureDir(targetPath);

  const files = await fs.readdir(sourcePath);

  for (const file of files) {
    const sourceFile = path.join(sourcePath, file);
    const targetFile = path.join(targetPath, file);

    const stat = await fs.stat(sourceFile);

    if (stat.isFile()) {
      let content = await fs.readFile(sourceFile, 'utf-8');

      // Apply skill transformation if defined
      if (platform.transformSkill && file === 'SKILL.md') {
        content = platform.transformSkill(content);
      }

      // Don't overwrite existing files
      if (!await fs.pathExists(targetFile)) {
        await fs.writeFile(targetFile, content, 'utf-8');
      }
    } else if (stat.isDirectory()) {
      await copySkillDirectory(sourceFile, targetFile, platform);
    }
  }
}

async function copyAgents(
  targetBase: string,
  platform: PlatformConfig,
  category?: string
): Promise<number> {
  const agentsSource = path.join(TEMPLATES_DIR, 'agents');
  const agentsTarget = path.join(targetBase, platform.agentsDir);

  if (!await fs.pathExists(agentsSource)) {
    console.log(chalk.yellow('  ⚠ No agents templates found'));
    return 0;
  }

  await fs.ensureDir(agentsTarget);

  const agents = await fs.readdir(agentsSource);
  let count = 0;

  for (const agent of agents) {
    const sourcePath = path.join(agentsSource, agent);

    if (category && !agent.includes(category)) continue;

    const stat = await fs.stat(sourcePath);
    if (stat.isFile() && agent.endsWith('.agent.md')) {
      // Generate target filename with platform-specific extension
      const baseName = agent.replace('.agent.md', '');
      const targetFilename = baseName + platform.agentExtension;
      const targetPath = path.join(agentsTarget, targetFilename);

      // Read source content
      let content = await fs.readFile(sourcePath, 'utf-8');

      // Apply agent transformation if defined
      if (platform.transformAgent) {
        content = platform.transformAgent(content, agent);
      }

      // Don't overwrite existing files
      if (!await fs.pathExists(targetPath)) {
        await fs.writeFile(targetPath, content, 'utf-8');
        console.log(chalk.green(`    ✓ Agent: ${baseName}`));
        count++;
      }
    }
  }

  return count;
}
