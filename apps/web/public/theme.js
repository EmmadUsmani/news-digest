(() => {
  let theme;
  try {
    theme = localStorage.getItem('news-digest-theme');
  } catch {}
  const dark =
    theme === 'dark' ||
    (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})();
