async function getHls() {
  if (window.Hls) {
    return window.Hls;
  }

  try {
    var module = await import('./hls-vendor.js');
    return module.H;
  } catch (error) {
    return null;
  }
}

export async function startMoviePlayer(options) {
  var video = document.querySelector(options.videoSelector);
  var button = document.querySelector(options.buttonSelector);
  var url = options.url;
  var prepared = false;
  var hls = null;

  if (!video || !button || !url) {
    return;
  }

  async function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    var Hls = await getHls();
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  }

  async function play() {
    button.classList.add('is-hidden');
    await prepare();
    try {
      await video.play();
    } catch (error) {
      button.classList.remove('is-hidden');
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
