import { useEffect } from 'react';

const BG_STORAGE_KEY = 'auction_bg_image';

/**
 * BackgroundManager - Applies user-selected background images to the page.
 * Usage: Call window.setBgImage(url) to change the background.
 *        Call window.setBgImage(null) to remove it.
 */
export const BackgroundManager = () => {
  useEffect(() => {
    const bgUrl = localStorage.getItem(BG_STORAGE_KEY);
    applyBackground(bgUrl);

    // Expose global functions for setting background
    window.setBgImage = (url) => {
      if (url) {
        localStorage.setItem(BG_STORAGE_KEY, url);
      } else {
        localStorage.removeItem(BG_STORAGE_KEY);
      }
      applyBackground(url);
    };

    window.getBgImage = () => localStorage.getItem(BG_STORAGE_KEY);

    return () => {
      delete window.setBgImage;
      delete window.getBgImage;
    };
  }, []);

  return null;
};

function applyBackground(url) {
  if (url && url.trim() !== '') {
    document.body.classList.add('has-bg-image');
    document.body.style.setProperty('--bg-image-url', `url(${url})`);
  } else {
    document.body.classList.remove('has-bg-image');
    document.body.style.removeProperty('--bg-image-url');
  }
}
