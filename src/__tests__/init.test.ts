import path from 'path';
import os from 'os';

// Minimal mocking approach with strict path handling
jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  ensureDir: jest.fn(),
  copy: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}));

jest.mock('chalk', () => ({
  cyan: (s: string) => s,
  green: (s: string) => s,
  yellow: (s: string) => s,
  dim: (s: string) => s,
  blue: (s: string) => s,
  bold: (s: string) => s
}));

// Import mocked module explicitly
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra');
import { initCommand } from '../commands/init';

describe('initCommand', () => {
  let consoleLogSpy: jest.SpyInstance;
   // Use standard paths to avoid OS-specific issues in string matching
  const homeDir = path.normalize('/home/testuser');
  const cwd = path.normalize('/projects/myproject');

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(os, 'homedir').mockReturnValue(homeDir);
    jest.spyOn(process, 'cwd').mockReturnValue(cwd);
    
    // Default safe implementations
    fs.pathExists.mockResolvedValue(true);
    fs.readdir.mockResolvedValue([]);
    fs.stat.mockResolvedValue({ isDirectory: () => false, isFile: () => true });
    fs.ensureDir.mockResolvedValue(undefined);
    fs.copy.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue('content');
    fs.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('basic functionality', () => {
    it('should complete installation successfully', async () => {
      await initCommand({});
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Installation complete'));
    });

    it('should install for copilot', async () => {
      await initCommand({ target: 'copilot' });
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('GitHub Copilot'));
    });
  });

  describe('skill installation', () => {
    it('should install skills when they exist', async () => {
      // Setup specific directory structure
      fs.readdir.mockImplementation((p: string) => {
        const pStr = String(p);
        if (pStr.endsWith('skills')) return Promise.resolve(['test-skill']);
        if (pStr.endsWith('test-skill')) return Promise.resolve(['SKILL.md']);
        return Promise.resolve([]);
      });

      fs.stat.mockImplementation((p: string) => {
        const pStr = String(p);
        if (pStr.endsWith('test-skill')) return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        if (pStr.endsWith('SKILL.md')) return Promise.resolve({ isDirectory: () => false, isFile: () => true });
        return Promise.resolve({ isDirectory: () => false, isFile: () => true });
      });

      fs.readFile.mockResolvedValue('skill content');

      await initCommand({ target: 'copilot' });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skill: test-skill'));
    });
  });

  describe('agent installation', () => {
    it('should install agents when they exist', async () => {
      fs.readdir.mockImplementation((p: string) => {
        const pStr = String(p);
        if (pStr.endsWith('agents')) return Promise.resolve(['test.agent.md']);
        return Promise.resolve([]);
      });
      
      fs.stat.mockResolvedValue({ isDirectory: () => false, isFile: () => true });
      fs.readFile.mockResolvedValue('agent content');
      
      // Return false for target file check so it writes
      fs.pathExists.mockImplementation((p: string) => {
         const pStr = String(p);
         if (pStr.includes('test.md') || pStr.includes('test.agent.md')) return Promise.resolve(false);
         return Promise.resolve(true); // source files exist
      });

      await initCommand({ target: 'copilot' });

      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('sharedDir functionality', () => {
    it('should copy shared resources for antigravity', async () => {
      // Mock structure: skills/complex-skill/{SKILL.md, data/, scripts/}
      fs.readdir.mockImplementation((p: string) => {
        const pStr = String(p);
        if (pStr.endsWith('skills')) return Promise.resolve(['complex-skill']);
        if (pStr.endsWith('complex-skill')) return Promise.resolve(['SKILL.md', 'data', 'scripts']);
        // Important: return empty for data and scripts to stop recursion
        if (pStr.endsWith('data')) return Promise.resolve([]);
        if (pStr.endsWith('scripts')) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      fs.stat.mockImplementation((p: string) => {
        const pStr = String(p);
        if (pStr.endsWith('complex-skill')) return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        if (pStr.endsWith('data')) return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        if (pStr.endsWith('scripts')) return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        // Files
        return Promise.resolve({ isDirectory: () => false, isFile: () => true });
      });

      // Mock pathExists to return true for shared resources checks
      fs.pathExists.mockImplementation((p: string) => {
         const pStr = String(p);
         if (pStr.includes('complex-skill')) return Promise.resolve(true); 
         // allow default checks to pass
         return Promise.resolve(true);
      });

      await initCommand({ target: 'antigravity' });

      // Should copy data and scripts
      // We expect fs.copy to be called for data and scripts
      expect(fs.copy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Shared resources'));
    });
  });
});
