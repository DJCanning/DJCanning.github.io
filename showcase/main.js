/**
 * LAYR — Scroll-scrubbed product video
 * Desktop: scroll-driven inspection
 * Mobile: looping turntable
 */

const video = document.getElementById("spin-video");
const section = document.getElementById("spin-section");

// Bail safely if elements aren't on the page
if (!video || !section) {
  console.warn("Spin video or section not found");
} else {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  /* -----------------------------
     MOBILE BEHAVIOUR
  ----------------------------- */
  if (isMobile) {
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    // Start playback once metadata is available
    video.addEventListener("loadedmetadata", () => {
      video.play().catch(() => {
        // Autoplay may be blocked on some devices — acceptable fallback
      });
    });
  }

  /* -----------------------------
     DESKTOP SCROLL SCRUB
  ----------------------------- */
  if (!isMobile) {
    let isTicking = false;

    // Prime the video so currentTime updates are respected
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = 0;
      video.play().then(() => video.pause());
    });

    function scrubVideo() {
      if (!video.duration) return;

      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;

      // Exit early if section is completely off‑screen
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      // How far we’ve scrolled *through the section*
      const scrolled = Math.min(
        Math.max(-rect.top, 0),
        scrollable
      );

      const linear = scrolled / scrollable;

      // Smoothstep easing for controlled motion
      const eased = linear * linear * (3 - 2 * linear);

      // Full video range (100%)
      video.currentTime = eased * video.duration;
    }

    window.addEventListener("scroll", () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          scrubVideo();
          isTicking = false;
        });
        isTicking = true;
      }
    });

    window.addEventListener("resize", scrubVideo);
  }
}
