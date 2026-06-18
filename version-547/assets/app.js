(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

    panels.forEach(function (panel) {
      var scope = panel.parentElement ? panel.parentElement.parentElement : document;
      var searchInput = panel.querySelector('.js-search');
      var yearSelect = panel.querySelector('.js-filter-year');
      var regionSelect = panel.querySelector('.js-filter-region');
      var typeSelect = panel.querySelector('.js-filter-type');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var query = new URLSearchParams(window.location.search).get('q');

      if (query && searchInput) {
        searchInput.value = query;
      }

      function apply() {
        var text = normalize(searchInput ? searchInput.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');

        cards.forEach(function (card) {
          var matchesText = !text || normalize(card.getAttribute('data-search')).indexOf(text) !== -1;
          var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
          var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
          var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
          card.classList.toggle('is-hidden', !(matchesText && matchesYear && matchesRegion && matchesType));
        });
      }

      [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  setupFilters();
})();

function setupMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !button || !options.stream) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(options.stream);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = options.stream;
  }

  function startPlayback() {
    loadStream();
    button.classList.add('is-hidden');
    video.controls = true;

    var playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  button.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (!loaded) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
