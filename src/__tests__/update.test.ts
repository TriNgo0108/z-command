import * as cp from 'child_process';
import { runUpdate } from '../commands/update';

describe('runUpdate', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockChild = (opts: { exitCode?: number, error?: Error }): cp.ChildProcess => {
    const child = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      kill: jest.fn(),
      pid: 123,
      on: jest.fn(),
    };

    child.on.mockImplementation((event: string, cb: any) => {
      // Logic: If error is passed, ONLY fire error event.
      // If exitCode is passed (and no error), fire close event.
      
      if (opts.error && event === 'error') {
        cb(opts.error);
      } else if (opts.exitCode !== undefined && event === 'close' && !opts.error) {
        cb(opts.exitCode);
      }
      return child;
    });

    return child as unknown as cp.ChildProcess;
  };

  it('should spawn npm install and succeed', async () => {
    const mockChild = createMockChild({ exitCode: 0 });
    const mockSpawn = jest.fn().mockReturnValue(mockChild);

    await runUpdate(mockSpawn as unknown as typeof cp.spawn);

    expect(mockSpawn).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update successful'));
  });

  it('should reject when update fails', async () => {
    const mockChild = createMockChild({ exitCode: 1 });
    const mockSpawn = jest.fn().mockReturnValue(mockChild);

    await expect(runUpdate(mockSpawn as unknown as typeof cp.spawn)).rejects.toThrow('Update process exited with code 1');
  });

  it('should reject on spawn error', async () => {
    const mockChild = createMockChild({ error: new Error('Spawn failed') });
    const mockSpawn = jest.fn().mockReturnValue(mockChild);
  
    await expect(runUpdate(mockSpawn as unknown as typeof cp.spawn)).rejects.toThrow('Spawn failed');
  });
});
