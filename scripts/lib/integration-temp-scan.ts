import { readFileSync } from 'node:fs';

import { processReferences } from './integration-temp';

const references = processReferences(Number(process.argv[2]));
if (!references) process.exit(1);
const directories = JSON.parse(readFileSync(0, 'utf8')) as string[];
process.stdout.write(
  JSON.stringify(
    directories.filter((directory) =>
      references.some((value) => value.includes(directory)),
    ),
  ),
);
