// utils/setThemeCookie.ts
export function setThemeCookie(theme: 'dark' | 'light') {
  document.cookie = `theme=${theme}; path=/; max-age=31536000`;
}
