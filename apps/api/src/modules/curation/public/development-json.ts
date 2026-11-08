import type { LlmRequest, LlmResponse } from '../domain/llm.port';

interface DevelopmentRuntime {
  complete(
    request: Omit<LlmRequest, 'model' | 'purpose'> & {
      role: 'haiku' | 'sonnet';
    },
    attemptId: string,
  ): Promise<
    | { status: 'disabled' | 'replay' | 'input-limit' }
    | { status: 'budget-refused'; mustReport: boolean }
    | { status: 'complete'; value: LlmResponse; mustReport: boolean }
  >;
}

/** Per-test-edition editor bridge. No production ledger, cache or repair calls.
 * Stopped accounting outcomes throw so editor model fallbacks cannot conceal a
 * pool stop. Invalid completed output is already charged and may fall back.
 */
export function developmentJson(
  runtime: DevelopmentRuntime,
  editionId: string,
) {
  if (!editionId.trim()) throw new Error('Missing development edition ID');
  let sequence = 0;
  let stopped = false;
  return {
    async json<T>(
      request: LlmRequest,
      validate: (value: unknown) => T,
      _options: { repair?: boolean } = {},
    ): Promise<T | null> {
      if (stopped) throw new Error('Development editing stopped');
      const role =
        request.model.id === 'claude-haiku-5-5'
          ? 'haiku'
          : request.model.id === 'claude-sonnet-5-5'
            ? 'sonnet'
            : null;
      if (!role) throw new Error('Unsupported development editor model');
      const { model: _model, purpose: _purpose, ...input } = request;
      // Allocate before awaiting: parallel topic calls must never share a hold.
      const attemptId = `${editionId}:editor:${++sequence}`;
      let outcome: Awaited<ReturnType<DevelopmentRuntime['complete']>>;
      try {
        outcome = await runtime.complete({ ...input, role }, attemptId);
      } catch (error) {
        stopped = true;
        throw error;
      }
      if (outcome.status !== 'complete' || outcome.mustReport) {
        stopped = true;
        throw new Error(
          'Development editing stopped: ' +
            ('mustReport' in outcome && outcome.mustReport
              ? 'report required'
              : outcome.status),
        );
      }
      try {
        return validate(JSON.parse(outcome.value.text));
      } catch {
        return null;
      }
    },
  };
}
