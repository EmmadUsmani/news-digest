// Reject unattributed offline work even when its pool would make no requests.
export function assertProtectedObligationIdentity(
  runId: string,
  topicIds: readonly string[],
) {
  if (
    !runId.trim() ||
    topicIds.length === 0 ||
    topicIds.some((id) => !id.trim()) ||
    new Set(topicIds).size !== topicIds.length
  )
    throw new Error('Invalid protected obligation identity');
}
