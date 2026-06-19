(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function siteRoot() {
        return document.body.getAttribute('data-site-root') || '.';
    }

    function withRoot(path) {
        var root = siteRoot();
        if (root === '.' || root === './') {
            return './' + path.replace(/^\//, '');
        }
        return root.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    }

    function initializeImages() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
            }, { once: true });
        });
    }

    function initializeMobileNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initializeGlobalSearch() {
        document.querySelectorAll('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var target = withRoot('search.html');
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initializeHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        restart();
    }

    function initializeCardFilters() {
        var area = document.querySelector('[data-card-filter-area]');
        if (!area) {
            return;
        }
        var textInput = area.querySelector('[data-card-filter]');
        var selects = Array.prototype.slice.call(area.querySelectorAll('[data-filter-field]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        function matches(card) {
            var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
            if (keyword) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                if (haystack.indexOf(keyword) === -1) {
                    return false;
                }
            }
            return selects.every(function (select) {
                var field = select.getAttribute('data-filter-field');
                var value = select.value;
                if (!value) {
                    return true;
                }
                return String(card.getAttribute('data-' + field) || '') === value;
            });
        }

        function apply() {
            cards.forEach(function (card) {
                card.style.display = matches(card) ? '' : 'none';
            });
        }

        if (textInput) {
            textInput.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card" data-movie-card>',
            '    <a class="poster-shell" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '        <span class="play-dot">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-card-meta">',
            '            <a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.categoryName) + '</a>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function initializeSearchPage() {
        var consoleElement = document.querySelector('[data-search-console]');
        var results = document.querySelector('[data-search-results]');
        if (!consoleElement || !results || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var input = consoleElement.querySelector('[data-search-input]');
        var category = consoleElement.querySelector('[data-search-category]');
        var type = consoleElement.querySelector('[data-search-type]');
        var year = consoleElement.querySelector('[data-search-year]');
        var button = consoleElement.querySelector('[data-search-button]');

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function applySearch() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var categoryValue = category ? category.value : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (categoryValue && movie.categorySlug !== categoryValue) {
                    return false;
                }
                if (typeValue && movie.type !== typeValue) {
                    return false;
                }
                if (yearValue && String(movie.year) !== yearValue) {
                    return false;
                }
                return true;
            }).slice(0, 120);

            if (!matched.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请换一个关键词。</div>';
                return;
            }

            results.innerHTML = matched.map(cardTemplate).join('');
            initializeImages();
        }

        [input, category, type, year].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', applySearch);
        });
        if (button) {
            button.addEventListener('click', applySearch);
        }
        applySearch();
    }

    function initializePlayer() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var start = player.querySelector('[data-player-start]');
            if (!video || !start) {
                return;
            }

            var loaded = false;
            var hlsInstance = null;
            var hlsUrl = video.getAttribute('data-hls');
            var fallbackUrl = video.getAttribute('data-fallback');

            function useFallback() {
                if (!fallbackUrl) {
                    return;
                }
                video.src = fallbackUrl;
                video.load();
            }

            function loadSource() {
                if (loaded) {
                    return;
                }
                loaded = true;

                if (hlsUrl && window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(hlsUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            useFallback();
                        }
                    });
                    return;
                }

                if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = hlsUrl;
                    video.load();
                    return;
                }

                useFallback();
            }

            function play() {
                loadSource();
                start.classList.add('is-hidden');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        start.classList.remove('is-hidden');
                    });
                }
            }

            start.addEventListener('click', play);
            video.addEventListener('play', function () {
                start.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    start.classList.remove('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                loadSource();
            }, { once: true });
        });
    }

    ready(function () {
        initializeImages();
        initializeMobileNavigation();
        initializeGlobalSearch();
        initializeHero();
        initializeCardFilters();
        initializeSearchPage();
        initializePlayer();
    });
}());
