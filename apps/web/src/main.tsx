import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Health } from '@digest/contracts';
import './style.css';
function App() {
 const [health, setHealth] = React.useState<Health | null>(null);
 React.useEffect(() => { fetch('/healthz').then(r => r.json()).then(setHealth).catch(() => setHealth({ status: 'degraded', database: false, redis: false })); }, []);
 return <main><header><a href="/" aria-label="News Digest home">ND<span> / News Digest</span></a><span className="edition">YOUR DAILY PERSPECTIVE</span></header><section><p className="eyebrow">LESS SCROLLING. MORE CONTEXT.</p><h1>Make time for<br/>what matters.</h1><p className="intro">Your important stories, brought together in one thoughtful digest.</p><div className="empty"><span className="number">01 / GETTING STARTED</span><h2>Your first edition is on its way.</h2><p>We’re building your news desk. Live sources and curated digests aren’t connected yet. No sample stories are shown here.</p></div><aside aria-live="polite"><span className={health?.status === 'ok' ? 'dot good' : 'dot'} />{health ? health.status === 'ok' ? 'System online · Database and queue connected' : 'System needs attention' : 'Checking system status…'}</aside></section><footer>A little less noise. A clearer view.</footer></main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
