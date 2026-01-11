import path from 'path';
import fs from 'fs-extra';
import os from 'os';

// Mock dependencies before imports
jest.mock('fs-extra');
jest.mock('chalk', () => ({
  cyan: (s: string) => s,
  green: (s: string) => s,
  yellow: (s: string) => s,
  dim: (s: string) => s
}));

// Import after mocking
import { initCommand } from '../commands/init';

// Type-safe mocks
const mockPathExists = jest.spyOn(fs, 'pathExists');
const mockReaddir = jest.spyOn(fs, 'readdir');
const mockStat = jest.spyOn(fs, 'stat');
const mockEnsureDir = jest.spyOn(fs, 'ensureDir');
const mockCopy = jest.spyOn(fs, 'copy');

describe('initCommand', () => {
  let consoleLogSpy: jest.SpyInstance;
  const mockHomeDir = '/home/testuser';
  const mockCwd = '/projects/myproject';

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(os, 'homedir').mockReturnValue(mockHomeDir);
    jest.spyOn(process, 'cwd').mockReturnValue(mockCwd);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('target directory selection', () => {
    beforeEach(() => {
      mockPathExists.mockResolvedValue(true as never);
      mockEnsureDir.mockResolvedValue(undefined as never);
      mockReaddir.mockResolvedValue([] as never);
    });

    it('should use .github folder in current directory by default', async () => {
      await initCommand({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('.github')
      );
    });

    it('should use .copilot folder in home directory with --global flag', async () => {
      await initCommand({ global: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('.copilot')
      );
    });
  });

  describe('skill installation', () => {
    beforeEach(() => {
      mockPathExists.mockResolvedValue(true as never);
      mockEnsureDir.mockResolvedValue(undefined as never);
      mockCopy.mockResolvedValue(undefined as never);
    });

    it('should install skills when no flags specified', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('skills')) {
          return Promise.resolve(['code-review']);
        }
        return Promise.resolve([]);
      }) as typeof fs.readdir);
      mockStat.mockResolvedValue({ isDirectory: () => true, isFile: () => false } as never);

      await initCommand({});

      expect(mockCopy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skills: 1'));
    });

    it('should only install skills with --skills flag', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('skills')) {
          return Promise.resolve(['code-review', 'security-review']);
        }
        return Promise.resolve(['test.agent.md']);
      }) as typeof fs.readdir);
      mockStat.mockResolvedValue({ isDirectory: () => true, isFile: () => false } as never);

      await initCommand({ skills: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skills: 2'));
    });

    it('should filter skills by category when specified', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('skills')) {
          return Promise.resolve(['code-review', 'security-review', 'test-driven-development']);
        }
        return Promise.resolve([]);
      }) as typeof fs.readdir);
      mockStat.mockResolvedValue({ isDirectory: () => true, isFile: () => false } as never);

      await initCommand({ skills: true, category: 'security' });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skills: 1'));
    });
  });

  describe('agent installation', () => {
    beforeEach(() => {
      mockPathExists.mockResolvedValue(true as never);
      mockEnsureDir.mockResolvedValue(undefined as never);
      mockCopy.mockResolvedValue(undefined as never);
    });

    it('should install agents when no flags specified', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('agents')) {
          return Promise.resolve(['ai-engineer.agent.md', 'backend-developer.agent.md']);
        }
        return Promise.resolve([]);
      }) as typeof fs.readdir);
      mockStat.mockResolvedValue({ isDirectory: () => false, isFile: () => true } as never);

      await initCommand({});

      expect(mockCopy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Agents: 2'));
    });

    it('should only install agents with --agents flag', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('agents')) {
          return Promise.resolve(['ai-engineer.agent.md']);
        }
        return Promise.resolve(['skill-folder']);
      }) as typeof fs.readdir);
      mockStat.mockResolvedValue({ isDirectory: () => false, isFile: () => true } as never);

      await initCommand({ agents: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Agents: 1'));
    });

    it('should filter agents by category when specified', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('agents')) {
          return Promise.resolve(['ai-engineer.agent.md', 'backend-developer.agent.md']);
        }
        return Promise.resolve([]);
      }) as typeof fs.readdir);
      mockStat.mockResolvedValue({ isDirectory: () => false, isFile: () => true } as never);

      await initCommand({ agents: true, category: 'ai' });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Agents: 1'));
    });
  });

  describe('when templates are missing', () => {
    it('should handle missing skills directory gracefully', async () => {
      mockPathExists.mockImplementation(((p: string) => {
        return Promise.resolve(!p.includes('skills'));
      }) as typeof fs.pathExists);
      mockEnsureDir.mockResolvedValue(undefined as never);
      mockReaddir.mockResolvedValue([] as never);

      await initCommand({ skills: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No skills templates found'));
    });

    it('should handle missing agents directory gracefully', async () => {
      mockPathExists.mockImplementation(((p: string) => {
        return Promise.resolve(!p.includes('agents'));
      }) as typeof fs.pathExists);
      mockEnsureDir.mockResolvedValue(undefined as never);
      mockReaddir.mockResolvedValue([] as never);

      await initCommand({ agents: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No agents templates found'));
    });
  });

  describe('output messages', () => {
    beforeEach(() => {
      mockPathExists.mockResolvedValue(true as never);
      mockEnsureDir.mockResolvedValue(undefined as never);
      mockReaddir.mockResolvedValue([] as never);
    });

    it('should show welcome message', async () => {
      await initCommand({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Z-Command')
      );
    });

    it('should show installation complete message', async () => {
      await initCommand({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation complete')
      );
    });
  });
});
