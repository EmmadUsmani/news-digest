import { AdminOverview } from './AdminOverview';
import { PublicStatusPage } from './PublicStatusPage';
// Select by deployment mode, never by the caller's admin role.
export function OperationsOverviewPage({
  publicMode,
}: {
  publicMode: boolean;
}) {
  return publicMode ? <PublicStatusPage /> : <AdminOverview />;
}
