export const getTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('finzora-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return 'light';
};

export const setTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem('finzora-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
};

export const initTheme = () => {
  const theme = getTheme();
  setTheme(theme);
};
