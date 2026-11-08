import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';

// Owner-invoked CLI, never part of application logging or service execution.
const [directory, emailInput] = process.argv.slice(2);
if (!directory || !emailInput) {
  process.stderr.write(
    'Usage: read-login-mailbox.ts ABSOLUTE_DIRECTORY EMAIL\n',
  );
  process.exitCode = 1;
} else {
  const code = await new FileLoginCodeDelivery(directory).latest(
    emailInput.trim().toLowerCase(),
    new Date(),
  );
  if (code) process.stdout.write(`${code}\n`);
  else {
    process.stderr.write('No unexpired code\n');
    process.exitCode = 1;
  }
}
