import type { XSearchRequest } from '../domain/x-search.port';

// Settlement and citation persistence precede this step. Only a successful
// bounded verification pass may unlock optional scheduled open-search admission.
export async function verifySearch(
  result: { state: string; callId?: string },
  request: XSearchRequest,
  scheduledDay: string | undefined,
  verify: (callId: string) => Promise<{ verificationErrors: number }>,
  complete: (callId: string) => Promise<void>,
) {
  if (result.state !== 'completed' || !result.callId) return;
  const verification = await verify(result.callId);
  if (
    verification.verificationErrors === 0 &&
    scheduledDay !== undefined &&
    request.handles === undefined &&
    request.reactionStory === undefined
  )
    await complete(result.callId);
  return verification;
}
