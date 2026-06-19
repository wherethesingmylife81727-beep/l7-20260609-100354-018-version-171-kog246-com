(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileToggle && mobilePanel) {
      mobileToggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startSlider() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide") || 0));
          startSlider();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startSlider();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startSlider();
        });
      }
      startSlider();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    filterPanels.forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var yearSelect = panel.querySelector(".filter-year");
      var kindSelect = panel.querySelector(".filter-kind");
      var container = panel.parentElement;
      var items = Array.prototype.slice.call(container.querySelectorAll(".searchable-item"));
      var empty = panel.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      if (yearSelect) {
        var years = items.map(function (item) {
          return item.getAttribute("data-year");
        }).filter(Boolean).filter(function (value, index, array) {
          return array.indexOf(value) === index;
        }).sort(function (a, b) {
          return Number(b) - Number(a);
        });

        years.forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      }

      function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var kind = kindSelect ? kindSelect.value : "";
        var visible = 0;

        items.forEach(function (item) {
          var text = item.textContent.toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = !year || item.getAttribute("data-year") === year;
          var matchesKind = !kind || item.getAttribute("data-kind") === kind;
          var show = matchesQuery && matchesYear && matchesKind;
          item.classList.toggle("hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilters);
      }
      if (kindSelect) {
        kindSelect.addEventListener("change", applyFilters);
      }
      applyFilters();
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movieVideo");
  var overlay = document.querySelector("[data-player-overlay]");
  var attached = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }

    attached = true;
  }

  function playVideo() {
    attachStream();
    video.controls = true;
    if (overlay) {
      overlay.classList.add("hidden");
    }
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(function () {
        if (overlay) {
          overlay.classList.remove("hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      playVideo();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
