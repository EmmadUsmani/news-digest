// Keep the Tech-only rollout compatible with the seeded live topic name.
export function usesTechEditorialContext(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return normalized === 'tech' || normalized === 'tech & ai';
}
