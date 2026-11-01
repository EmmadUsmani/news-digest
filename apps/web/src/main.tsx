import React from 'react';
import { createRoot } from 'react-dom/client';
import { profileSettingsSchema, topicSchema } from '@digest/contracts';
import type { Health, Topic, ProfileSettings } from '@digest/contracts';
import './style.css';
function App() {
 const [topics, setTopics] = React.useState<Topic[]>([]);
 const [profile, setProfile] = React.useState<ProfileSettings | null>(null);
 const [settingsError, setSettingsError] = React.useState(false);
 React.useEffect(() => { Promise.all([fetch('/api/topics').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => topicSchema.array().parse(data)), fetch('/api/profile').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => profileSettingsSchema.parse(data))]).then(([topics, profile]) => { setTopics(topics); setProfile(profile); }).catch(() => setSettingsError(true)); }, []);
 const [health, setHealth] = React.useState<Health | null>(null);
 React.useEffect(() => { fetch('/healthz').then(r => r.json()).then(setHealth).catch(() => setHealth({ status: 'degraded', database: false, redis: false })); }, []);
 return <main><header><a href="/" aria-label="News Digest home">ND<span> / News Digest</span></a><span className="edition">YOUR DAILY PERSPECTIVE</span></header><section><p className="eyebrow">LESS SCROLLING. MORE CONTEXT.</p><h1>Make time for<br/>what matters.</h1><p className="intro">Your important stories, brought together in one thoughtful digest.</p><div className="empty"><span className="number">01 / GETTING STARTED</span><h2>Your first edition is on its way.</h2><p>We’re building your news desk. Live sources and curated digests aren’t connected yet. No sample stories are shown here.</p></div><section className="topics" aria-label="Your topics"><p className="eyebrow">YOUR NEWS DESK</p><h2>Your topics, brought together.</h2>{settingsError ? <p role="alert">Topic settings could not be loaded. Please try again.</p> : <><div className="topic-grid">{topics.filter(t => t.enabled).map(t => <article key={t.id}><h3>{t.name}</h3><p>{t.description}</p><small>Up to {t.storyBudget} stories · {t.postBudget} posts</small></article>)}</div>{profile && <p className="schedule-note">Planned edition: daily at {profile.schedule.cadence.split(' ')[1].padStart(2, '0')}:{profile.schedule.cadence.split(' ')[0].padStart(2, '0')} ({profile.schedule.timezone.replaceAll('_', ' ')}) · Previous 24 hours. Automatic delivery is not connected yet.</p>}</>}</section><aside aria-live="polite"><span className={health?.status === 'ok' ? 'dot good' : 'dot'} />{health ? health.status === 'ok' ? 'System online · Database and queue connected' : 'System needs attention' : 'Checking system status…'}</aside></section><footer>A little less noise. A clearer view.</footer></main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
