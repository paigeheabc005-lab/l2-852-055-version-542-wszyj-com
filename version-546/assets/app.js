(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function initSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
    panels.forEach(function(panel) {
      var input = panel.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var category = "all";

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function(card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          var textMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var categoryMatch = category === "all" || card.getAttribute("data-category") === category;
          card.classList.toggle("is-hidden", !(textMatch && categoryMatch));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function(chip) {
        chip.addEventListener("click", function() {
          chips.forEach(function(item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          category = chip.getAttribute("data-filter-value") || "all";
          apply();
        });
      });
    });
  }

  function initPlayer(streamUrl, videoId, buttonId) {
    var video = document.getElementById(videoId || "movieVideo");
    var button = document.getElementById(buttonId || "playOverlay");
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function() {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function() {
    initNavigation();
    initHero();
    initSearch();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
