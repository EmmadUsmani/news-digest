import { AdminOverview } from './AdminOverview';
import { PublicStatusPage } from './PublicStatusPage';
// Prepared composition only. Install with public page authorization and the
// sanitized API transport; never infer access from the caller's admin role.
export function OperationsOverviewPage({
  publicMode,
}: {
  publicMode: boolean;
}) {
  return publicMode ? <PublicStatusPage /> : <AdminOverview />;
}
