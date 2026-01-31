import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import os from 'os';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import { InitOptions, PlatformConfig, InstallResult } from '../types';
import { getTargetPlatforms } from '../platforms';

async function ensureTemplates(): Promise<string> {
  // 1. Check for local templates (dev mode)
  const localTemplates = path.join(__dirname, '..', '..', 'templates');
  if (await fs.pathExists(localTemplates)) {
    return localTemplates;
  }

  // 2. Check for zipped templates (prod mode)
  const zipPath = path.join(__dirname, '..', '..', 'templates.zip');
  if (await fs.pathExists(zipPath)) {
    // Generate hash of zip file to determine if we need to re-extract
    const fileBuffer = await fs.readFile(zipPath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const tempDir = path.join(os.tmpdir(), 'z-command-templates', hash);
    const templatesDir = path.join(tempDir, 'templates');

    if (!await fs.pathExists(templatesDir)) {
      console.log(chalk.dim('📦 Extracting templates...'));
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(tempDir, true);
    }
    
    return templatesDir;
  }

  throw new Error('Templates not found! Please reinstall the package.');
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.cyan('\n🚀 Z-Command - Installing AI Coding Assistant Skills & Agents\n'));

  const platforms = getTargetPlatforms(options.target);
  const templatesDir = await ensureTemplates();
  const results: InstallResult[] = [];

  for (const platform of platforms) {
    console.log(chalk.blue(`\n📦 Installing for ${platform.displayName}...`));

    const result = await installForPlatform(platform, options, templatesDir);
    results.push(result);

    console.log(chalk.dim(`   Location: ${result.location}`));
  }

  // Configure git excludes
  await configureGitExcludes();

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

async function configureGitExcludes(): Promise<void> {
  try {
    const gitDir = path.join(process.cwd(), '.git');
    if (!await fs.pathExists(gitDir)) {
      return;
    }

    const infoDir = path.join(gitDir, 'info');
    await fs.ensureDir(infoDir);

    const excludeFile = path.join(infoDir, 'exclude');
    let content = '';

    if (await fs.pathExists(excludeFile)) {
      content = await fs.readFile(excludeFile, 'utf-8');
    }

    const ignores = ['.shared', '.skills', '.agents', '.agent', ".claude", ".cursor", "agents", "skills"];
    let added = false;

    // Ensure content ends with newline if not empty
    if (content && !content.endsWith('\n')) {
      content += '\n';
    }

    for (const ignore of ignores) {
      if (!content.includes(ignore)) {
        content += `${ignore}\n`;
        added = true;
      }
    }

    if (added) {
      await fs.writeFile(excludeFile, content, 'utf-8');
      console.log(chalk.dim('   Updated .git/info/exclude to ignore .shared, .skills, and .agents'));
    }
  } catch (error) {
    // Silently fail if we can't update git exclude
    // console.error('Failed to update git exclude:', error);
  }
}

async function installForPlatform(
  platform: PlatformConfig,
  options: InitOptions,
  templatesDir: string
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
    skillsCount = await copySkills(targetBase, platform, templatesDir, options.category);
  }

  // Install agents
  if (installAgents) {
    agentsCount = await copyAgents(targetBase, platform, templatesDir, options.global, options.category);
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
  templatesDir: string,
  category?: string
): Promise<number> {
  const skillsSource = path.join(templatesDir, 'skills');
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
  templatesDir: string,
  isGlobal: boolean = false,
  category?: string
): Promise<number> {
  const agentsSource = path.join(templatesDir, 'agents');
  
  // Determine target directory (use globalAgentsDir if global mode and defined)
  const agentsDir = (isGlobal && platform.globalAgentsDir) 
    ? platform.globalAgentsDir 
    : platform.agentsDir;
    
  const agentsTarget = path.join(targetBase, agentsDir);

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
