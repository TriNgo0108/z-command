import path from 'path';
import fs from 'fs-extra';

// Mock dependencies before imports
jest.mock('fs-extra');
jest.mock('chalk', () => ({
  cyan: (s: string) => s,
  bold: (s: string) => s,
  green: (s: string) => s,
  yellow: (s: string) => s,
  dim: (s: string) => s
}));

// Import after mocking
import { listCommand } from '../commands/list';

// Type-safe mocks
const mockPathExists = jest.spyOn(fs, 'pathExists');
const mockReaddir = jest.spyOn(fs, 'readdir');
const mockStat = jest.spyOn(fs, 'stat');
const mockReadFile = jest.spyOn(fs, 'readFile');

describe('listCommand', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('when templates exist', () => {
    beforeEach(() => {
      mockPathExists.mockResolvedValue(true as never);
    });

    it('should list both skills and agents by default', async () => {
      mockReaddir.mockImplementation(((dirPath: string) => {
        if (dirPath.includes('skills')) {
          return Promise.resolve(['code-review', 'security-review']);
        }
        return Promise.resolve(['ai-engineer.agent.md', 'backend-developer.agent.md']);
      }) as typeof fs.readdir);

      mockStat.mockResolvedValue({ isDirectory: () => true } as never);
      mockReadFile.mockResolvedValue('description: Test description for template' as never);

      await listCommand({});

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Available Templates'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skills:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Agents:'));
    });

    it('should list only skills when --skills flag is set', async () => {
      mockReaddir.mockResolvedValue(['code-review'] as never);
      mockStat.mockResolvedValue({ isDirectory: () => true } as never);
      mockReadFile.mockResolvedValue('description: Code review skill' as never);

      await listCommand({ skills: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Skills:'));
    });

    it('should list only agents when --agents flag is set', async () => {
      mockReaddir.mockResolvedValue(['ai-engineer.agent.md'] as never);
      mockReadFile.mockResolvedValue('description: AI Engineer agent' as never);

      await listCommand({ agents: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Agents:'));
    });
  });

  describe('when templates do not exist', () => {
    it('should show warning when no skills found', async () => {
      mockPathExists.mockImplementation(((p: string) => {
        return Promise.resolve(!p.includes('skills'));
      }) as typeof fs.pathExists);
      mockReaddir.mockResolvedValue([] as never);

      await listCommand({ skills: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No skills found'));
    });

    it('should show warning when no agents found', async () => {
      mockPathExists.mockImplementation(((p: string) => {
        return Promise.resolve(!p.includes('agents'));
      }) as typeof fs.pathExists);
      mockReaddir.mockResolvedValue([] as never);

      await listCommand({ agents: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No agents found'));
    });
  });

  describe('description extraction', () => {
    beforeEach(() => {
      mockPathExists.mockResolvedValue(true as never);
      mockStat.mockResolvedValue({ isDirectory: () => true } as never);
    });

    it('should extract description from YAML frontmatter', async () => {
      mockReaddir.mockResolvedValue(['test-skill'] as never);
      mockReadFile.mockResolvedValue('---\ndescription: A helpful skill for testing\n---\nContent' as never);

      await listCommand({ skills: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('A helpful skill for testing'));
    });

    it('should show "No description" when not found', async () => {
      mockReaddir.mockResolvedValue(['test-skill'] as never);
      mockReadFile.mockResolvedValue('No frontmatter here' as never);

      await listCommand({ skills: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No description'));
    });
  });
});
