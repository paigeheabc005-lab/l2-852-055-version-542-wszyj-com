(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    window.setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };
  var applyFilter = function (value) {
    var key = normalize(value);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent);
      var matched = !key || haystack.indexOf(key) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  };
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    applyFilter(initial);
    searchInput.addEventListener('input', function () {
      applyFilter(searchInput.value);
    });
  }

  var setupPlayer = function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-cover]');
    var playButtons = Array.prototype.slice.call(box.querySelectorAll('[data-play]'));
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var loaded = false;
    var loadVideo = function () {
      if (loaded || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        box._hls = hls;
      } else {
        video.src = source;
      }
      loaded = true;
    };
    var playVideo = function () {
      loadVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          video.controls = true;
        });
      }
    };
    playButtons.forEach(function (button) {
      button.addEventListener('click', playVideo);
    });
    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });
  };
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
