(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(value) {
    var term = normalize(value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-filter-card'));
    var empty = document.querySelector('[data-empty-state]');
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search') || card.textContent);
      var matched = !term || haystack.indexOf(term) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  function initHeader() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function setSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        setSlide(index);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initFilters() {
    var input = document.querySelector('[data-page-filter]');
    var clear = document.querySelector('[data-clear-filter]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
      applyFilter(query);
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }

    if (clear && input) {
      clear.addEventListener('click', function () {
        input.value = '';
        applyFilter('');
      });
    }

    document.querySelectorAll('[data-filter-term]').forEach(function (button) {
      button.addEventListener('click', function () {
        var term = button.getAttribute('data-filter-term') || '';
        if (input) {
          input.value = term;
        }
        applyFilter(term);
      });
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
  });
})();
