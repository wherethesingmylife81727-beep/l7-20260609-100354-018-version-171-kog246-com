import { H as Hls } from './video-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-player]');
    var toggle = document.querySelector('[data-player-toggle]');
    var status = document.querySelector('[data-player-status]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var hasLoaded = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function loadSource() {
        if (hasLoaded || !source) {
            return;
        }

        hasLoaded = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已加载，点击播放按钮开始观看');
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络加载异常，正在尝试恢复播放');
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体解码异常，正在尝试恢复播放');
                    hlsInstance.recoverMediaError();
                } else {
                    setStatus('当前播放源暂时无法播放，请稍后重试');
                    hlsInstance.destroy();
                }
            });
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已加载，点击播放按钮开始观看');
            });
            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络加载异常，正在尝试恢复播放');
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体解码异常，正在尝试恢复播放');
                    hlsInstance.recoverMediaError();
                } else {
                    setStatus('当前播放源暂时无法播放，请稍后重试');
                    hlsInstance.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            setStatus('播放源已加载，点击播放按钮开始观看');
        } else {
            setStatus('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或 Firefox');
        }
    }

    function playVideo() {
        loadSource();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                setStatus('浏览器阻止了自动播放，请再次点击播放器开始播放');
            });
        }
    }

    if (toggle) {
        toggle.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (toggle) {
            toggle.classList.add('is-hidden');
        }
        setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
        if (toggle) {
            toggle.classList.remove('is-hidden');
        }
        setStatus('已暂停，点击继续播放');
    });

    video.addEventListener('ended', function () {
        if (toggle) {
            toggle.classList.remove('is-hidden');
        }
        setStatus('播放结束');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
});
