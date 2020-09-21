class ChromiumDriver {
    start({ width, height }) {
        console.log('[ChromiumDriver] Starting with', { width, height });
    }

    stop() {
        console.log('[ChromiumDriver] Stopped');
    }

    openUrl(url) {
        console.log('[ChromiumDriver] Opening', url);
    }
}

module.exports = ChromiumDriver;
