(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    function resetHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      startHero();
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
        resetHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        resetHero();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        resetHero();
      });
    }

    showSlide(0);
    startHero();

    var searchInput = document.querySelector("[data-search-input]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function applyQueryFromUrl() {
      if (!searchInput) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        searchInput.value = q;
      }
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function(card) {
        var text = [card.dataset.title, card.dataset.tags, card.dataset.genre, card.dataset.region].join(" ").toLowerCase();
        var typeOk = !type || card.dataset.type === type;
        var yearOk = !year || card.dataset.year === year;
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !(typeOk && yearOk && keywordOk);
      });
    }

    applyQueryFromUrl();
    [searchInput, typeSelect, yearSelect].forEach(function(el) {
      if (el) {
        el.addEventListener("input", filterCards);
        el.addEventListener("change", filterCards);
      }
    });
    filterCards();
  });
})();
