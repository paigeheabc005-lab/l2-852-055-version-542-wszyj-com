(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function move(step) {
      show(active + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (slides.length > 0) {
      show(0);
      start();
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
  }

  const filterRoots = Array.from(document.querySelectorAll('[data-filter-root]'));
  filterRoots.forEach(function (root) {
    const searchInput = root.querySelector('[data-filter-search]');
    const yearInput = root.querySelector('[data-filter-year]');
    const categoryInput = root.querySelector('[data-filter-category]');
    const cards = Array.from(root.querySelectorAll('[data-movie-card]'));
    const empty = root.querySelector('[data-empty-state]');

    function filter() {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const year = yearInput ? yearInput.value : '';
      const category = categoryInput ? categoryInput.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        const yearMatched = !year || card.dataset.year === year;
        const categoryMatched = !category || card.dataset.category === category;
        const keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        const matched = yearMatched && categoryMatched && keywordMatched;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible === 0 ? 'block' : 'none';
      }
    }

    [searchInput, yearInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', filter);
        input.addEventListener('change', filter);
      }
    });
  });
})();
