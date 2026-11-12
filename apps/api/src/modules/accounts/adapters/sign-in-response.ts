import { setTimeout } from 'node:timers/promises';

// Start the response floor before account lookup, locking and mailbox delivery.
// Even refusals and dependency failures must wait for the same floor.
export async function signInResponse<T>(
  work: () => Promise<T>,
  wait: (milliseconds: number) => Promise<unknown> = setTimeout,
): Promise<T> {
  const floor = wait(1_000);
  try {
    return await work();
  } finally {
    await floor;
  }
}
