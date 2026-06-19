(function() {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function filterCards(input) {
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var visible = 0;
        cards.forEach(function(card) {
            var text = normalize(card.getAttribute('data-text'));
            var matched = !query || text.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        var empty = document.querySelector('[data-empty-state]');
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    ready(function() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function() {
                menu.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var index = 0;
            var show = function(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            };
            dots.forEach(function(dot, i) {
                dot.addEventListener('click', function() {
                    show(i);
                });
            });
            if (slides.length > 1) {
                setInterval(function() {
                    show(index + 1);
                }, 5200);
            }
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var queryInputs = Array.prototype.slice.call(document.querySelectorAll('[data-query-input]'));
        queryInputs.forEach(function(input) {
            input.value = query;
        });

        var localInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
        localInputs.forEach(function(input) {
            if (query && input.hasAttribute('data-query-input')) {
                filterCards(input);
            }
            input.addEventListener('input', function() {
                filterCards(input);
            });
        });

        var localForms = Array.prototype.slice.call(document.querySelectorAll('.local-filter-form'));
        localForms.forEach(function(form) {
            form.addEventListener('submit', function(event) {
                var input = form.querySelector('[data-local-filter]');
                if (input) {
                    event.preventDefault();
                    filterCards(input);
                }
            });
        });
    });
})();
