(function () {
  'use strict';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initBackTop() {
    var button = qs('[data-back-top]');
    if (!button) {
      return;
    }

    function update() {
      if (window.scrollY > 420) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  function initHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var dotsWrap = qs('[data-hero-dots]', carousel);
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function renderDots() {
      if (!dotsWrap) {
        return;
      }
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot' + (index === current ? ' is-active' : '');
        dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 部');
        dot.addEventListener('click', function () {
          go(index);
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function go(index) {
      slides[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      renderDots();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        go(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(current + 1);
        restart();
      });
    }

    renderDots();
    restart();
  }

  function uniqueOptions(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || '';
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function initFilters() {
    var toolbar = qs('[data-filter-toolbar]');
    var list = qs('[data-filter-list]');
    if (!toolbar || !list) {
      return;
    }

    var cards = qsa('[data-movie-card]', list);
    var keyword = qs('[data-filter-keyword]', toolbar);
    var year = qs('[data-filter-year]', toolbar);
    var type = qs('[data-filter-type]', toolbar);
    var reset = qs('[data-filter-reset]', toolbar);
    var count = qs('[data-filter-count]', toolbar);

    uniqueOptions(cards, 'data-year').forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      year.appendChild(option);
    });

    uniqueOptions(cards, 'data-type').forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      type.appendChild(option);
    });

    function apply() {
      var term = (keyword.value || '').trim().toLowerCase();
      var selectedYear = year.value;
      var selectedType = type.value;
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();

        var matched = true;
        if (term && haystack.indexOf(term) === -1) {
          matched = false;
        }
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          matched = false;
        }
        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          matched = false;
        }

        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        keyword.value = '';
        year.value = '';
        type.value = '';
        apply();
      });
    }

    apply();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var primaryButton = qs('[data-play-button]', player);
      var secondaryButton = qs('[data-play-button-secondary]');
      var status = qs('[data-player-status]', player);
      var source = player.getAttribute('data-source');
      var fallback = player.getAttribute('data-fallback');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function loadSource() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        setStatus('正在加载播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && fallback) {
              setStatus('HLS 加载异常，已切换备用视频源');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
              video.src = fallback;
              video.load();
            }
          });
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.load();
          setStatus('使用浏览器原生 HLS 播放');
          return Promise.resolve();
        }

        if (fallback) {
          video.src = fallback;
          video.load();
          setStatus('使用备用视频源播放');
          return Promise.resolve();
        }

        setStatus('当前浏览器暂不支持该播放源');
        return Promise.resolve();
      }

      function playOrPause() {
        loadSource().then(function () {
          if (video.paused) {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch(function () {
                setStatus('请再次点击播放按钮');
              });
            }
          } else {
            video.pause();
          }
        });
      }

      if (primaryButton) {
        primaryButton.addEventListener('click', function () {
          primaryButton.classList.add('is-hidden');
          playOrPause();
        });
      }

      if (secondaryButton) {
        secondaryButton.addEventListener('click', playOrPause);
      }

      video.addEventListener('play', function () {
        if (primaryButton) {
          primaryButton.classList.add('is-hidden');
        }
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        setStatus('已暂停');
      });
    });
  }

  function createSearchCard(item) {
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="poster-link" href="' + item.url + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <span class="poster-art" style="--poster-url: url(\'' + item.cover + '\');"></span>',
      '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
      '    <span class="card-play">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var form = qs('[data-search-page-form]');
    var input = qs('[data-search-input]');
    var results = qs('[data-search-results]');
    var summary = qs('[data-search-summary]');

    if (!form || !input || !results || !summary || !window.SEARCH_DATA) {
      return;
    }

    function getQuery() {
      var params = new URLSearchParams(window.location.search);
      return (params.get('q') || '').trim();
    }

    function render(query) {
      var term = String(query || '').trim().toLowerCase();
      input.value = query || '';

      if (!term) {
        results.innerHTML = '';
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }

      var matched = window.SEARCH_DATA.filter(function (item) {
        var haystack = [item.title, item.year, item.type, item.region, item.genre, item.tags, item.oneLine, item.category].join(' ').toLowerCase();
        return haystack.indexOf(term) !== -1;
      }).slice(0, 120);

      summary.textContent = '关键词 “' + query + '” 找到 ' + matched.length + ' 条结果，最多显示前 120 条。';
      results.innerHTML = matched.map(createSearchCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });

    render(getQuery());
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initBackTop();
    initHeroCarousel();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
