(function () {
  var menuToggle = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-missing");
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var urlParams = new URLSearchParams(window.location.search);
  var queryParam = urlParams.get("q") || "";
  var searchPageInput = document.getElementById("search-page-input");

  if (searchPageInput && queryParam) {
    searchPageInput.value = queryParam;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function collectText(item) {
    return normalize([
      item.getAttribute("data-title"),
      item.getAttribute("data-type"),
      item.getAttribute("data-year"),
      item.getAttribute("data-region"),
      item.getAttribute("data-genre"),
      item.getAttribute("data-tags"),
      item.textContent
    ].join(" "));
  }

  function matchesType(item, type) {
    if (!type || type === "all") {
      return true;
    }

    return collectText(item).indexOf(normalize(type)) !== -1;
  }

  function applyFilter(scope) {
    var input = scope.querySelector(".filter-input") || searchPageInput;
    var activeButton = scope.querySelector(".filter-pills button.active");
    var type = activeButton ? activeButton.getAttribute("data-filter-type") : "all";
    var query = input ? normalize(input.value) : "";
    var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row"));

    items.forEach(function (item) {
      var text = collectText(item);
      var visible = (!query || text.indexOf(query) !== -1) && matchesType(item, type);
      item.classList.toggle("hidden-by-filter", !visible);
    });
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.parentElement ? scope.parentElement.querySelector(".filter-input") : null;
    var wrapper = scope.parentElement || document;

    if (input) {
      input.addEventListener("input", function () {
        applyFilter(wrapper);
      });
    }

    wrapper.querySelectorAll(".filter-pills button").forEach(function (button) {
      button.addEventListener("click", function () {
        wrapper.querySelectorAll(".filter-pills button").forEach(function (other) {
          other.classList.remove("active");
        });
        button.classList.add("active");
        applyFilter(wrapper);
      });
    });

    if (input && input.value) {
      applyFilter(wrapper);
    }
  });

  if (searchPageInput && queryParam) {
    var searchWrapper = searchPageInput.closest(".section-block");
    if (searchWrapper) {
      applyFilter(searchWrapper);
    }
  }

  var video = document.querySelector("[data-video-player]");
  var playTrigger = document.querySelector("[data-play-trigger]");
  var hlsInstance = null;
  var sourceAttached = false;

  function attachVideoSource() {
    if (!video || sourceAttached) {
      return;
    }

    var source = video.getAttribute("data-video");

    if (!source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      sourceAttached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      sourceAttached = true;
    }
  }

  function startVideo() {
    if (!video) {
      return;
    }

    attachVideoSource();
    video.controls = true;

    if (playTrigger) {
      playTrigger.classList.add("is-hidden");
    }

    var promise = video.play();

    if (promise && promise.catch) {
      promise.catch(function () {
        if (playTrigger) {
          playTrigger.classList.remove("is-hidden");
        }
      });
    }
  }

  if (playTrigger) {
    playTrigger.addEventListener("click", startVideo);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (playTrigger) {
        playTrigger.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (playTrigger && video.currentTime === 0) {
        playTrigger.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
