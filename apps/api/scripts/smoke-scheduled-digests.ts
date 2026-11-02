// Retired: this probe changed the live schedule and could leave it overwritten.
// The disposable-service suite covers scheduling and publication without live writes.
throw new Error(
  'Live schedule probes are disabled. Run pnpm test for isolated scheduling coverage.',
);
