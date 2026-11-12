import { AsyncLocalStorage } from 'node:async_hooks';

import type { LlmExecutionContext } from '../domain/llm.port';

// Separate from durable budget ownership. Only internal composition supplies it.
const execution = new AsyncLocalStorage<LlmExecutionContext | undefined>();

export function withLlmExecution<T>(
  context: LlmExecutionContext | undefined,
  work: () => T,
): T {
  return execution.run(context, work);
}

export function currentLlmExecution() {
  return execution.getStore();
}
