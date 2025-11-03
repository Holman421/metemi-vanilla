const initVideoOptimization = () => {
  "use strict";

  let videos = [];
  let observer = null;

  function init() {
    videos = Array.from(document.querySelectorAll("video:not(.not-autoplay)"));

    if (videos.length === 0) {
      return;
    }

    createObserver();

    videos.forEach((video) => {
      observer.observe(video);
    });

    setInterval(checkForNewVideos, 2000);
  }

  function createObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            loadVideoIfNeeded(video);
            playVideo(video);
          } else {
            pauseVideo(video);
          }
        });
      },
      options
    );
  }

  function loadVideoIfNeeded(video) {
    if (video.dataset.loaded === "true") {
      return; // already lazy-loaded
    }

    const sources = video.querySelectorAll("source[data-src]");
    if (sources.length > 0) {
      sources.forEach((source) => {
        source.src = source.dataset.src;
      });
      video.load();
    } else if (video.dataset.src) {
      video.src = video.dataset.src;
      video.load();
    }

    video.dataset.loaded = "true";
  }

  function playVideo(video) {
    // Don't auto-play videos that have controls attribute - let user control them
    if (video.hasAttribute('controls')) {
      return;
    }

    if (video.paused) {
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // playing successfully
          })
          .catch((error) => {
            console.log("Video play failed:", error);
            if (error.name === "NotAllowedError") {
              console.log("Autoplay blocked by browser policy");
            }
          });
      }
    }
  }

  function pauseVideo(video) {
    if (!video.paused) {
      video.pause();
    }
  }

  function checkForNewVideos() {
    const currentVideos = Array.from(
      document.querySelectorAll("video:not(.not-autoplay)")
    );

    currentVideos.forEach((video) => {
      if (!videos.includes(video)) {
        videos.push(video);
        observer.observe(video);
      }
    });
  }

  function cleanup() {
    if (observer) {
      observer.disconnect();
    }
    videos.forEach((video) => {
      pauseVideo(video);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("beforeunload", cleanup);

  return {
    cleanup,
  };
};

// Initialize on load
if (typeof window !== "undefined") {
  window.initVideoOptimization = initVideoOptimization;
}
