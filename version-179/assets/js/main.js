(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                startHero();
            });
        });

        startHero();
    }

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var categoryButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var typeButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-type-filter]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var activeCategory = 'all';
        var activeType = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function setActive(buttons, currentButton) {
            buttons.forEach(function (button) {
                button.classList.toggle('is-active', button === currentButton);
            });
        }

        function applyFilters() {
            var query = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var category = card.getAttribute('data-category') || '';
                var type = card.getAttribute('data-type') || '';
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchCategory = activeCategory === 'all' || category === activeCategory;
                var matchType = activeType === 'all' || type === activeType;
                card.style.display = matchQuery && matchCategory && matchType ? '' : 'none';
            });
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        categoryButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter') || 'all';
                setActive(categoryButtons, button);
                applyFilters();
            });
        });

        typeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-type-filter') || 'all';
                setActive(typeButtons, button);
                applyFilters();
            });
        });
    });
})();
