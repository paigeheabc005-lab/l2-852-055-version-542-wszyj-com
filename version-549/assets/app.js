(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initHeroSlider();
    initLocalFilters();
    initPlayer();
    initSearchPage();
    initBackToTop();
    initImageFallback();
  });

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    slider.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    slider.addEventListener('mouseleave', restart);
    start();
  }

  function initLocalFilters() {
    var list = document.querySelector('.category-list');
    if (!list) {
      return;
    }
    var input = document.querySelector('.local-filter');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function valueOf(card, key) {
      return (card.getAttribute('data-' + key) || '').toLowerCase();
    }

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = select.value.toLowerCase();
      });
      cards.forEach(function (card) {
        var haystack = [
          valueOf(card, 'title'),
          valueOf(card, 'region'),
          valueOf(card, 'type'),
          valueOf(card, 'year'),
          valueOf(card, 'genre')
        ].join(' ');
        var matchedTerm = !term || haystack.indexOf(term) !== -1;
        var matchedFilters = Object.keys(filters).every(function (key) {
          return !filters[key] || valueOf(card, key) === filters[key];
        });
        card.classList.toggle('hidden-by-filter', !(matchedTerm && matchedFilters));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  function initPlayer() {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var src = shell.getAttribute('data-video');
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached || !video || !src) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = src;
    }

    function play() {
      attach();
      shell.classList.add('is-playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          shell.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');
    if (!results || !summary || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var formInput = document.querySelector('.hero-search input[name="q"]');
    if (formInput) {
      formInput.value = query;
    }
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_INDEX.filter(function (item) {
      var haystack = [item.title, item.desc, item.category, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 120);
    summary.textContent = '“' + query + '” 的搜索结果';
    if (!matched.length) {
      results.innerHTML = '<div class="search-summary">没有找到匹配内容，请尝试更换关键词。</div>';
      return;
    }
    results.innerHTML = matched.map(function (item, idx) {
      return [
        '<a class="rank-item" href="./' + escapeHtml(item.url) + '">',
        '  <div class="rank-cover">',
        '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="rank-number">' + (idx + 1) + '</span>',
        '  </div>',
        '  <div class="rank-text">',
        '    <h3>' + escapeHtml(item.title) + '</h3>',
        '    <p>' + escapeHtml(item.desc) + '</p>',
        '    <div>',
        '      <span>' + escapeHtml(item.category) + '</span>',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.year) + '</span>',
        '    </div>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function initBackToTop() {
    var button = document.querySelector('.back-to-top');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('is-visible', window.scrollY > 500);
    }
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    update();
  }

  function initImageFallback() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-off');
      });
    });
  }
}());
