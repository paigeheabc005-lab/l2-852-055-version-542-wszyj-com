(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var isOpen = mobileNav.hasAttribute("hidden") === false;
        if (isOpen) {
          mobileNav.setAttribute("hidden", "");
          toggle.setAttribute("aria-expanded", "false");
        } else {
          mobileNav.removeAttribute("hidden");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    }

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
          slide.classList.toggle("is-active", pos === current);
        });
        dots.forEach(function (dot, pos) {
          dot.classList.toggle("active", pos === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, pos) {
        dot.addEventListener("click", function () {
          show(pos);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var cardFilterInput = document.querySelector(".card-filter-input");
    if (cardFilterInput) {
      var scopedCards = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid .movie-card"));
      cardFilterInput.addEventListener("input", function () {
        var value = cardFilterInput.value.trim().toLowerCase();
        scopedCards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          card.classList.toggle("is-hidden-by-filter", value && text.indexOf(value) === -1);
        });
      });
    }

    var searchInput = document.getElementById("site-search-input");
    var searchCategory = document.getElementById("site-search-category");
    if (searchInput && searchCategory) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (initial) {
        searchInput.value = initial;
      }
      var cards = Array.prototype.slice.call(document.querySelectorAll("#search-results .movie-card"));

      function runSearch() {
        var query = searchInput.value.trim().toLowerCase();
        var category = searchCategory.value;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var matchText = !query || text.indexOf(query) !== -1;
          var matchCategory = !category || cardCategory === category;
          card.classList.toggle("is-hidden-by-filter", !(matchText && matchCategory));
        });
      }

      searchInput.addEventListener("input", runSearch);
      searchCategory.addEventListener("change", runSearch);
      runSearch();
    }
  });
})();
