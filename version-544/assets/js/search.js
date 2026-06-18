(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createCard(movie) {
    var article = document.createElement('article');
    var tagsHtml = movie.tags.slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    article.className = 'movie-card';
    article.innerHTML = ''
      + '<a class="movie-cover" href="' + movie.url + '" aria-label="查看 ' + escapeHtml(movie.title) + '">'
      + '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
      + '  <span class="cover-gradient"></span>'
      + '  <span class="year-badge">' + movie.year + '</span>'
      + '  <span class="play-badge">▶</span>'
      + '</a>'
      + '<div class="movie-body">'
      + '  <div class="movie-meta-row">'
      + '    <span>' + escapeHtml(movie.region) + '</span>'
      + '    <span>' + escapeHtml(movie.type) + '</span>'
      + '    <strong>' + movie.score + '</strong>'
      + '  </div>'
      + '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>'
      + '  <p>' + escapeHtml(movie.oneLine) + '</p>'
      + '  <div class="tag-row">' + tagsHtml + '</div>'
      + '</div>';

    return article;
  }

  function initSearch() {
    var app = document.querySelector('[data-search-app]');

    if (!app || !window.MOVIES) {
      return;
    }

    var input = app.querySelector('[data-search-input]');
    var category = app.querySelector('[data-search-category]');
    var sort = app.querySelector('[data-search-sort]');
    var summary = app.querySelector('[data-search-summary]');
    var results = app.querySelector('[data-search-results]');

    input.value = getQueryValue('q');

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var selectedCategory = category.value;
      var selectedSort = sort.value;
      var filtered = window.MOVIES.filter(function (movie) {
        var text = movie.searchText.toLowerCase();
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var categoryMatch = selectedCategory === 'all' || movie.category === selectedCategory;
        return keywordMatch && categoryMatch;
      });

      filtered.sort(function (a, b) {
        if (selectedSort === 'year') {
          return b.year - a.year;
        }

        if (selectedSort === 'heat') {
          return b.heat - a.heat;
        }

        return b.score - a.score;
      });

      var limited = filtered.slice(0, 120);
      results.innerHTML = '';
      limited.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });

      summary.textContent = '找到 ' + filtered.length + ' 部影片，当前显示前 ' + limited.length + ' 部。';
    }

    input.addEventListener('input', apply);
    category.addEventListener('change', apply);
    sort.addEventListener('change', apply);

    apply();
  }

  ready(initSearch);
})();
