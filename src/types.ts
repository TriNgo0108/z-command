/**
 * Shared types for z-command multi-platform support
 */

export type Platform = "copilot" | "claude" | "antigravity" | "cursor" | "all";

export interface PlatformConfig {
  /** Internal platform identifier */
  name: Platform;
  /** Display name for CLI output */
  displayName: string;
  /** Project-level directory path (relative to cwd) */
  projectDir: string;
  /** Global directory path (relative to home) */
  globalDir: string;
  /** Subdirectory for agents/workflows/rules */
  agentsDir: string;
  /** Subdirectory for skills (null if not supported) */
  skillsDir: string | null;
  /** Shared resources directory for complex skills (null if not used) */
  sharedDir: string | null;
  /** File extension for agent files */
  agentExtension: string;
  /** Transform agent content for this platform */
  transformAgent?: (content: string, filename: string) => string;
  /** Transform skill content for this platform */
  transformSkill?: (content: string) => string;
}

export interface InitOptions {
  skills?: boolean;
  agents?: boolean;
  global?: boolean;
  category?: string;
  target?: Platform;
}

export interface ListOptions {
  skills?: boolean;
  agents?: boolean;
}

export interface InstallResult {
  platform: string;
  skillsCount: number;
  agentsCount: number;
  location: string;
}
