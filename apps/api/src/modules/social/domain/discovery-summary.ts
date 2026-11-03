interface DiscoveryEvidence {
  requestedTopic: { id: string; name: string } | null;
  searchType: string | null;
  status: string;
  costMicros: number | null;
  heldMicros: number;
  postsFetched: number | null;
  topics: {
    topicId: string | null;
    newVerifiedNow: number;
    outsideListNewVerifiedNow: number;
    unknownBaseline: number;
  }[];
}

// Attribute money only to reservation-time topic snapshots. Citation topics
// cannot identify the intended topic of a failed or empty historical search.
export function summarizeDiscovery(calls: DiscoveryEvidence[]) {
  const groups = new Map<
    string,
    {
      topicId: string | null;
      topicName: string | null;
      searchType: string | null;
      calls: number;
      succeeded: number;
      costMicros: number;
      unknownCostCalls: number;
      heldMicros: number;
      postsFetched: number;
      unknownFetchedCalls: number;
      newVerifiedNow: number;
      outsideListNewVerifiedNow: number;
      unknownBaseline: number;
    }
  >();
  for (const call of calls) {
    const key = JSON.stringify([
      call.requestedTopic?.id ?? null,
      call.searchType,
    ]);
    let group = groups.get(key);
    if (!group) {
      group = {
        topicId: call.requestedTopic?.id ?? null,
        topicName: call.requestedTopic?.name ?? null,
        searchType: call.searchType,
        calls: 0,
        succeeded: 0,
        costMicros: 0,
        unknownCostCalls: 0,
        heldMicros: 0,
        postsFetched: 0,
        unknownFetchedCalls: 0,
        newVerifiedNow: 0,
        outsideListNewVerifiedNow: 0,
        unknownBaseline: 0,
      };
      groups.set(key, group);
    }
    group.calls++;
    group.succeeded += Number(call.status === 'succeeded');
    group.costMicros += call.costMicros ?? 0;
    group.unknownCostCalls += Number(call.costMicros === null);
    group.heldMicros += call.heldMicros;
    group.postsFetched += call.postsFetched ?? 0;
    group.unknownFetchedCalls += Number(call.postsFetched === null);
    // Unattributed historical calls retain their citation evidence in calls;
    // never imply their citations establish requested-topic incremental yield.
    for (const topic of call.topics) {
      if (!call.requestedTopic || topic.topicId !== call.requestedTopic.id)
        continue;
      group.newVerifiedNow += topic.newVerifiedNow;
      group.outsideListNewVerifiedNow += topic.outsideListNewVerifiedNow;
      group.unknownBaseline += topic.unknownBaseline;
    }
  }
  return [...groups.values()];
}
