(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-search-form]'), function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = 'search.html';
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var keyword = filterBar.querySelector('[data-filter-keyword]');
    var region = filterBar.querySelector('[data-filter-region]');
    var year = filterBar.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');

    var applyFilter = function () {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!q || text.indexOf(q) !== -1) && (!r || cardRegion === r) && (!y || cardYear === y);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    [keyword, region, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var input = searchRoot.querySelector('[data-search-input]');
    var button = searchRoot.querySelector('[data-search-button]');
    var results = searchRoot.querySelector('[data-search-results]');
    var empty = searchRoot.querySelector('[data-search-empty]');
    var initial = params.get('q') || '';

    if (input) {
      input.value = initial;
    }

    var escapeHtml = function (value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    var cardTemplate = function (movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <span class="poster-wrap">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="poster-shade"></span>',
        '      <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '    </span>',
        '    <span class="movie-info">',
        '      <strong>' + escapeHtml(movie.title) + '</strong>',
        '      <span class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type + ' · ' + movie.genre) + '</span>',
        '      <span class="movie-desc">' + escapeHtml(movie.oneLine) + '</span>',
        '    </span>',
        '  </a>',
        '</article>'
      ].join('');
    };

    var render = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var matched = [];

      if (q) {
        matched = window.SEARCH_MOVIES.filter(function (movie) {
          return movie.searchText.indexOf(q) !== -1;
        }).slice(0, 120);
      }

      if (results) {
        results.innerHTML = matched.map(cardTemplate).join('');
      }

      if (empty) {
        empty.classList.toggle('show', matched.length === 0);
      }
    };

    if (button) {
      button.addEventListener('click', render);
    }

    if (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          render();
        }
      });
    }

    render();
  }
})();
