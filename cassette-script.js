const dict = {
    es: {
        subtitle: "pega tu video y déjalo sonar una y otra vez",
        placeholder: "Pega la URL o el ID del video de YouTube",
        load: "Cargar",
        restart: "⏮ reiniciar",
        pause: "⏯ pausa",
        play: "⏯ reproducir",
        hint: 'Pega el link completo o solo el ID del video. Una vez cargado, se repite automáticamente sin límite. Toca el botón <strong>1x</strong> para ver el video a doble velocidad.',
        alertInvalid: "No pude reconocer un ID de video válido. Revisa el link.",
        langToggle: "EN",
        themeLight: "🌙",
        themeDark: "☀️",
        madeBy: "hecho por"
    },
    en: {
        subtitle: "paste your video and let it play on repeat",
        placeholder: "Paste the YouTube video URL or ID",
        load: "Load",
        restart: "⏮ restart",
        pause: "⏯ pause",
        play: "⏯ play",
        hint: 'Paste the full link or just the video ID. Once loaded, it loops automatically with no limit.<br> Tap the <strong>1x</strong> button to watch at double speed.',
        alertInvalid: "Couldn't recognize a valid video ID. Check the link.",
        langToggle: "ES",
        themeLight: "🌙",
        themeDark: "☀️",
        madeBy: "made by"
    }
};

let currentLang = 'en';
let currentTheme = 'light';
let isPlaying = false;

function applyLang() {
    const t = dict[currentLang];
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key === 'pause') {
            el.textContent = isPlaying ? t.pause : t.play;
        } else {
            el.textContent = t[key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t[key];
    });
    document.getElementById('hintText').innerHTML = t.hint;
    document.getElementById('langBtn').textContent = t.langToggle;
}

function toggleLang() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    applyLang();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const t = dict[currentLang];
    document.getElementById('themeBtn').textContent = currentTheme === 'light' ? t.themeLight : t.themeDark;
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
}

let player;
let isDoubleSpeed = false;

function extractId(input) {
    input = input.trim();
    const idMatch = input.match(/(?:v=|\/embed\/|\.be\/|\/v\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (idMatch) return idMatch[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    return null;
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
            rel: 0,
            modestbranding: 1
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.seekTo(0);
        player.playVideo();
    }
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        applySpeed();
        applyLang();
    }
    if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        applyLang();
    }
}

function loadVideo() {
    const raw = document.getElementById('urlInput').value;
    const id = extractId(raw);

    if (!id) {
        alert(dict[currentLang].alertInvalid);
        return;
    }

    // Verificamos si el reproductor de YouTube ya se cargó
    if (!player || typeof player.loadPlaylist !== 'function') {
        alert(currentLang === 'es'
            ? "El reproductor se está cargando, espera un segundo e intenta de nuevo."
            : "The player is still loading, wait a second and try again.");
        return;
    }

    player.loadPlaylist({ listType: 'playlist', playlist: id, index: 0, loop: 1 });
}

function restart() {
    if (player && player.seekTo) player.seekTo(0);
}

function togglePlay() {
    if (!player) return;
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function toggleSpeed() {
    isDoubleSpeed = !isDoubleSpeed;
    const btn = document.getElementById('speedBtn');
    btn.textContent = isDoubleSpeed ? '2x' : '1x';
    btn.classList.toggle('active', isDoubleSpeed);
    applySpeed();
}

function applySpeed() {
    if (!player || !player.setPlaybackRate) return;
    player.setPlaybackRate(isDoubleSpeed ? 2 : 1);
}

applyLang();
applyTheme();