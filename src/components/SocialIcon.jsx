export default function SocialIcon({ name }) {
  if (name === 'youtube') return <svg className="social-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></svg>;
  if (name === 'soundcloud') return <svg className="social-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M2 13v3m3-5v7m3-9v9m3-7v7M14 18h5a3 3 0 0 0 .5-6A4.5 4.5 0 0 0 14 8.2Z" /></svg>;
  if (name === 'instagram') return <svg className="social-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="6" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></svg>;
  const paths = {
    tiktok: 'M16.6 2h-3.2v13.6a3.3 3.3 0 1 1-2.9-3.28V8.9a6.7 6.7 0 1 0 6.1 6.68V8.5a7.9 7.9 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7Z',
    linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.66 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.97V21h-4V9Z',
    discord: 'M20.3 5.4a17.7 17.7 0 0 0-4.4-1.4l-.2.4c1.6.4 2.6.9 3.6 1.6-3.9-1.9-9.6-1.9-13.4 0 1-.7 2.1-1.3 3.6-1.6l-.2-.4c-1.5.3-3 .8-4.4 1.4C2.3 9.7 1.6 13.8 2 17.9a17.9 17.9 0 0 0 5.4 2.7c.4-.6.8-1.2 1.1-1.9-.6-.2-1.2-.5-1.7-.9l.4-.3c3.3 1.5 6.9 1.5 10.2 0l.4.3c-.5.4-1.1.7-1.7.9.3.7.7 1.3 1.1 1.9a17.9 17.9 0 0 0 5.4-2.7c.5-4.7-.7-8.8-2.3-12.5ZM9 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z',
  };
  return <svg className="social-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={paths[name]} /></svg>;
}
