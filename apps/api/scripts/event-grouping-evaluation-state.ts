import { lstat, realpath } from 'node:fs/promises';

// Do not accept a CLI/env override: changing directories must not renew spend.
export const evaluationStateDirectory =
  '/home/exedev/.local/state/news-digest/item-26';

export async function checkEvaluationStateDirectory(
  directory = evaluationStateDirectory,
) {
  const info = await lstat(directory);
  if (
    !info.isDirectory() ||
    info.uid !== process.getuid?.() ||
    (info.mode & 0o777) !== 0o700 ||
    (await realpath(directory)) !== directory
  )
    throw new Error(
      'Evaluation state requires an owned, private real directory',
    );
}
