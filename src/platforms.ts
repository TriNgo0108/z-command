/**
 * Platform configurations for all supported AI coding assistants
 */

import { Platform, PlatformConfig } from './types';

/**
 * Transform agent content from GitHub Copilot format to Antigravity workflow format
 * Changes: name -> description in frontmatter, removes tools
 */
function transformToAntigravity(content: string, filename: string): string {
  // Parse YAML frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return content;

  const frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length).trim();

  // Extract description from frontmatter
  const descMatch = frontmatter.match(/description:\s*(.+)/);
  const description = descMatch ? descMatch[1].trim() : filename.replace('.agent.md', '');

  // Build new frontmatter for Antigravity workflow
  const newFrontmatter = `---
description: ${description}
---`;

  return `${newFrontmatter}\n\n${body}`;
}

/**
 * Transform agent content from GitHub Copilot format to Cursor rules format
 * Removes frontmatter entirely and restructures as guidelines
 */
function transformToCursor(content: string, filename: string): string {
  // Parse YAML frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  let body: string;
  let name: string;
  let description: string;

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    body = content.slice(frontmatterMatch[0].length).trim();

    // Extract name and description
    const nameMatch = frontmatter.match(/name:\s*(.+)/);
    const descMatch = frontmatter.match(/description:\s*(.+)/);

    name = nameMatch ? nameMatch[1].trim() : filename.replace('.agent.md', '');
    description = descMatch ? descMatch[1].trim() : '';
  } else {
    body = content;
    name = filename.replace('.agent.md', '');
    description = '';
  }

  // Format name as title
  const title = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Build Cursor rule format (no frontmatter, plain markdown)
  let result = `# ${title}\n\n`;

  if (description) {
    result += `${description}\n\n`;
  }

  result += body;

  return result;
}

/**
 * Platform configuration definitions
 */
export const PLATFORMS: Record<Exclude<Platform, 'all'>, PlatformConfig> = {
  copilot: {
    name: 'copilot',
    displayName: 'GitHub Copilot',
    projectDir: '.github',
    globalDir: '.copilot',
    agentsDir: 'agents',
    skillsDir: 'skills',
    sharedDir: null,
    agentExtension: '.agent.md',
    // No transformation needed - this is the source format
  },

  claude: {
    name: 'claude',
    displayName: 'Claude Code',
    projectDir: '.claude',
    globalDir: '.claude',
    agentsDir: 'agents',
    skillsDir: 'skills',
    sharedDir: null,
    agentExtension: '.agent.md',
    // Claude Code uses nearly identical format to Copilot
  },

  antigravity: {
    name: 'antigravity',
    displayName: 'Antigravity',
    projectDir: '.agent',
    globalDir: '.gemini/antigravity',
    agentsDir: 'workflows',
    globalAgentsDir: 'global_workflows',
    skillsDir: 'skills',
    sharedDir: '.shared',
    agentExtension: '.md',
    transformAgent: transformToAntigravity,
  },

  cursor: {
    name: 'cursor',
    displayName: 'Cursor',
    projectDir: '.cursor',
    globalDir: '.cursor',
    agentsDir: 'rules',
    skillsDir: null, // Cursor doesn't have skills concept
    sharedDir: null,
    agentExtension: '.md',
    transformAgent: transformToCursor,
  },
};

/**
 * Get all platform configs as an array
 */
export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(PLATFORMS);
}

/**
 * Get platform config by name
 */
export function getPlatform(name: Exclude<Platform, 'all'>): PlatformConfig {
  return PLATFORMS[name];
}

/**
 * Get platforms to install based on target option
 */
export function getTargetPlatforms(target?: Platform): PlatformConfig[] {
  if (!target || target === 'all') {
    return getAllPlatforms();
  }
  return [PLATFORMS[target]];
}
