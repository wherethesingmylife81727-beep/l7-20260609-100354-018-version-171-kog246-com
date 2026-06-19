
(function () {
  var mobileButton = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var nextIndex = Number(dot.getAttribute("data-slide") || 0);
      showSlide(nextIndex);
      if (timer) {
        window.clearInterval(timer);
        startSlides();
      }
    });
  });

  showSlide(0);
  startSlides();

  var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));

  panels.forEach(function (panel) {
    var input = panel.querySelector(".site-search");
    var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
    var container = panel.parentElement;
    var items = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .rank-item"));
    var activeFilter = "all";

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : "";

      items.forEach(function (item) {
        var text = (item.getAttribute("data-filter-text") || item.textContent || "").toLowerCase();
        var category = item.getAttribute("data-category") || "";
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedCategory = activeFilter === "all" || category === activeFilter;
        item.classList.toggle("is-hidden-card", !(matchedText && matchedCategory));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach(function (otherChip) {
          otherChip.classList.toggle("is-active", otherChip === chip);
        });
        applyFilters();
      });
    });
  });

  var hlsLoader = null;

  function ensureHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (!hlsLoader) {
      hlsLoader = document.createElement("script");
      hlsLoader.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      hlsLoader.async = true;
      document.head.appendChild(hlsLoader);
    }

    hlsLoader.addEventListener("load", callback, { once: true });
    hlsLoader.addEventListener("error", callback, { once: true });
  }

  function playVideo(shell) {
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var url = shell.getAttribute("data-hls");

    if (!video || !url) {
      return;
    }

    function start() {
      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (shell.getAttribute("data-ready") === "1") {
      start();
      return;
    }

    shell.setAttribute("data-ready", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      start();
      return;
    }

    ensureHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, start);
      } else {
        video.src = url;
        start();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
    var cover = shell.querySelector(".player-cover");
    var video = shell.querySelector("video");

    if (cover) {
      cover.addEventListener("click", function () {
        playVideo(shell);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!shell.getAttribute("data-ready")) {
          playVideo(shell);
        }
      });
    }
  });
})();
