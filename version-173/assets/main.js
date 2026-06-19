document.addEventListener("DOMContentLoaded", function() {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("siteNav");
    if (navButton && nav) {
        navButton.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        var showSlide = function(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === activeIndex);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === activeIndex);
            });
        };
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
    grids.forEach(function(grid) {
        var panel = grid.closest("main") ? grid.closest("main").querySelector(".filter-panel") : null;
        var input = panel ? panel.querySelector(".local-filter-input") : null;
        var buttons = panel ? Array.prototype.slice.call(panel.querySelectorAll("[data-year-filter]")) : [];
        var selectedYear = "all";
        var cards = Array.prototype.slice.call(grid.children);
        var filter = function() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function(card) {
                var text = card.getAttribute("data-filter") || "";
                var year = card.getAttribute("data-year") || "";
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchYear = selectedYear === "all" || year === selectedYear;
                card.classList.toggle("is-filtered-out", !(matchQuery && matchYear));
            });
        };
        if (input) {
            input.addEventListener("input", filter);
        }
        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                selectedYear = button.getAttribute("data-year-filter") || "all";
                buttons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                filter();
            });
        });
    });
});
