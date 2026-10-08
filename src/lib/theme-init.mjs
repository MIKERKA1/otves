// Runs inline in <head> before first paint so a manually chosen theme never flashes.
// The `js` class lets CSS hide the hero until its entrance animation starts (with a timed failsafe).
// Shared with astro.config.mjs, which hashes this exact string for the CSP.
export const THEME_INIT =
  "document.documentElement.classList.add('js');try{var t=localStorage.getItem('otves.theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}";
