(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var layer = player.querySelector("[data-player-layer]");
      var source = player.getAttribute("data-src");
      var attached = false;
      var hlsInstance = null;

      function attachSource() {
        if (!video || !source || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function() {});
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }
      if (layer) {
        layer.addEventListener("click", playVideo);
      }
      if (video) {
        video.addEventListener("click", function() {
          if (video.paused) {
            playVideo();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function() {
          if (layer) {
            layer.classList.add("is-hidden");
          }
        });
        video.addEventListener("emptied", function() {
          if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
      }
    });
  });
})();
