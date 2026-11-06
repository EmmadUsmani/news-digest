import { AdminOverview } from './AdminOverview';
import { DigestPreview } from './DigestPreview';

export function App({ admin = false }: { admin?: boolean }) {
  return admin ? <AdminOverview /> : <DigestPreview />;
}
