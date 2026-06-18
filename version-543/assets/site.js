(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  document.querySelectorAll('.js-hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var textInput = root.querySelector('[data-filter-text]');
    var regionSelect = root.querySelector('[data-filter-region]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-title]'));
    var empty = root.querySelector('.search-empty');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (textInput && q) {
      textInput.value = q;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var text = normalize(textInput ? textInput.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
        var matchesType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
        var shouldShow = matchesText && matchesRegion && matchesType && matchesYear;

        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
})();

function initPlayer(videoId, source) {
  var video = document.getElementById(videoId);

  if (!video) {
    return;
  }

  var frame = video.closest('.player-frame');
  var startButton = frame ? frame.querySelector('.player-start') : null;
  var attached = false;
  var hlsInstance = null;

  function attachSource() {
    if (attached) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    attached = true;
  }

  function playVideo() {
    attachSource();
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  if (startButton) {
    startButton.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (frame) {
      frame.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', function () {
    if (frame && video.currentTime === 0) {
      frame.classList.remove('is-playing');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
