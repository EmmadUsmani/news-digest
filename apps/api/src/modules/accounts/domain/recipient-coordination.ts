// All issuance, delivery and deletion work for one normalized email must share
// this boundary, including policy rechecks after waiting. Never nest it.
export abstract class RecipientCoordination {
  abstract run<T>(email: string, work: () => Promise<T>): Promise<T>;
}
