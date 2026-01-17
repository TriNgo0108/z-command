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

  describe('antigravity self-contained skills', () => {
    it('should keep skills self-contained without copying to shared folder', async () => {
      // Mock structure: skills/complex-skill/{SKILL.md, data/, scripts/}
      fs.readdir.mockImplementation((p: string) => {
        const pStr = String(p);
        if (pStr.endsWith('skills')) return Promise.resolve(['complex-skill']);
        if (pStr.endsWith('complex-skill')) return Promise.resolve(['SKILL.md', 'data', 'scripts']);
        // Return files for data and scripts subdirectories
        if (pStr.endsWith('data')) return Promise.resolve(['styles.csv']);
        if (pStr.endsWith('scripts')) return Promise.resolve(['search.py']);
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

      fs.pathExists.mockImplementation((p: string) => {
         const pStr = String(p);
         // Target files don't exist yet (so they get written)
         if (pStr.includes('.agent/skills')) return Promise.resolve(false);
         // Source files exist
         return Promise.resolve(true);
      });

      fs.readFile.mockResolvedValue('---\nname: test\n---\npython3 .claude/skills/complex-skill/scripts/search.py');

      await initCommand({ target: 'antigravity' });

      // Antigravity has sharedDir: null, so fs.copy should NOT be called for shared resources
      // Skills are self-contained - data/ and scripts/ stay inside the skill directory
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Shared resources'));
      
      // Verify skill was installed
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skill: complex-skill'));
    });
  });
});
