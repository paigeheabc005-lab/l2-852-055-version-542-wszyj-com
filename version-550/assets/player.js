(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      if (!video || !overlay) {
        return;
      }

      var stream = video.getAttribute("data-video");
      var loaded = false;
      var hls = null;

      function start() {
        if (!stream) {
          return;
        }

        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");

        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
        }

        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
