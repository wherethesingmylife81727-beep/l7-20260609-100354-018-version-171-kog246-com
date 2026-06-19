function startMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playOverlay");
    if (!video || !button || !streamUrl) {
        return;
    }

    var attached = false;
    var attachStream = function() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = streamUrl;
        }
    };

    var play = function() {
        attachStream();
        button.classList.add("is-hidden");
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function() {
                button.classList.remove("is-hidden");
            });
        }
    };

    button.addEventListener("click", play);
    video.addEventListener("click", function() {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function() {
        button.classList.add("is-hidden");
    });
}
