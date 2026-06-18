(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-menu-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var next = carousel.querySelector('[data-hero-next]');
    var prev = carousel.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    restart();
  }

  function initFiltering() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

    roots.forEach(function (root) {
      var input = root.querySelector('[data-filter-input]');
      var category = root.querySelector('[data-filter-category]');
      var sort = root.querySelector('[data-sort-select]');
      var section = root.parentElement;
      var grid = section ? section.querySelector('[data-movie-grid]') : null;
      var count = root.querySelector('[data-filter-count]');
      var empty = section ? section.querySelector('[data-empty-state]') : null;

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

      function numeric(card, name) {
        return Number(card.getAttribute('data-' + name)) || 0;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedCategory = category ? category.value : 'all';
        var visible = [];

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-title') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchCategory = selectedCategory === 'all' || selectedCategory === cardCategory;
          var isVisible = matchKeyword && matchCategory;

          card.hidden = !isVisible;

          if (isVisible) {
            visible.push(card);
          }
        });

        if (sort && sort.value !== 'default') {
          visible.sort(function (a, b) {
            return numeric(b, sort.value) - numeric(a, sort.value);
          });

          visible.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (count) {
          count.textContent = String(visible.length);
        }

        if (empty) {
          empty.hidden = visible.length !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      if (category) {
        category.addEventListener('change', apply);
      }

      if (sort) {
        sort.addEventListener('change', apply);
      }

      apply();
    });
  }

  function initPlayer() {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-player-status]');
    var source = shell.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮');
        });
      }
    }

    function initialize() {
      if (initialized || !video || !source) {
        playVideo();
        return;
      }

      initialized = true;
      setStatus('正在加载播放源');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
          playVideo();
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，可刷新页面重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源已就绪');
          playVideo();
        }, { once: true });
      } else {
        video.src = source;
        setStatus('当前浏览器可能需要 HLS 支持组件');
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        initialize();
      });
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFiltering();
    initPlayer();
  });
})();
