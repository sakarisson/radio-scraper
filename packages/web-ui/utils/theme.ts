export const THEME_STORAGE_KEY = "theme";

// Runs before first paint (see layout.tsx) so a stored choice doesn't flash.
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;
