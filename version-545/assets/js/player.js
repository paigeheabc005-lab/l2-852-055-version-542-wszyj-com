(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    var attached = false;
    var hls = null;

    if (!video || !overlay || !source) {
      return;
    }

    var attach = function () {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var play = function () {
      attach();
      overlay.classList.add('hidden');
      var task = video.play();
      if (task && typeof task.catch === 'function') {
        task.catch(function () {});
      }
    };

    overlay.addEventListener('click', play);
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
