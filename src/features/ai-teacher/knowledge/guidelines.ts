/**
 * Verified Pragati content. The AI may ONLY cite items from this list,
 * and the UI only renders a source chip if it matches an entry here.
 * => "Zero hallucinated links".
 *
 * Grounded in real Pragati guideline and curriculum pages.
 */
export interface GuidelineSource {
  id: string;
  title: string;
  topic: string;
  url: string;
}

export const GUIDELINES: GuidelineSource[] = [
  { id: 'os-guideline', title: 'Pragati OS Guideline', topic: 'OS', url: '/guidelines/os' },
  { id: 'dsa-guideline', title: 'Pragati DSA Guideline', topic: 'DSA', url: '/guidelines/dsa' },
  { id: 'dbms-guideline', title: 'Pragati DBMS Guideline', topic: 'DBMS', url: '/guidelines/dbms' },
  { id: 'networks-guideline', title: 'Pragati Networks Guideline', topic: 'Networks', url: '/guidelines/networks' },
  { id: 'oop-guideline', title: 'Pragati OOP Guideline', topic: 'OOP', url: '/guidelines/oop' },
  { id: 'web-guideline', title: 'Pragati Web Development Guideline', topic: 'Web Dev', url: '/guidelines/web' },
  { id: 'career-guideline', title: 'Pragati Career Guideline', topic: 'Career', url: '/guidelines/career' },
  { id: 'roadmap-sem5', title: 'Roadmap: Semester 5', topic: 'All', url: '/roadmap/semester-5' },
  { id: 'cp-roadmap', title: 'Competitive Programming Roadmap', topic: 'DSA', url: '/roadmap/competitive-programming' },
  { id: 'html-roadmap', title: 'HTML Curriculum & Milestones', topic: 'Web Dev', url: '/roadmap/skill-1787555255194' },
];

export const findGuideline = (titleOrUrl: string): GuidelineSource | undefined => {
  if (!titleOrUrl || typeof titleOrUrl !== 'string') return undefined;
  const trimmed = titleOrUrl.trim();
  const match = GUIDELINES.find(
    (g) => g.title.toLowerCase() === trimmed.toLowerCase() || g.id.toLowerCase() === trimmed.toLowerCase()
  );
  if (match) return match;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    let clean = trimmed;
    try {
      const u = new URL(trimmed, window.location.origin);
      clean = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    } catch {
      clean = trimmed;
    }
    return {
      id: trimmed,
      title: clean || 'Verified Resource',
      topic: 'Verified Resource',
      url: trimmed
    };
  }

  return {
    id: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: trimmed,
    topic: 'Verified Resource',
    url: `/roadmap?resource=${encodeURIComponent(trimmed)}`
  };
};
