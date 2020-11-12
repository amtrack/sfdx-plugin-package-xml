import * as child from 'child_process';
import * as path from 'path';

export default function sfdxPlugin(
  args: readonly string[],
  options?: child.SpawnSyncOptions
): child.SpawnSyncReturns<Buffer> {
  return child.spawnSync(path.resolve('bin', 'run'), args, options);
}
