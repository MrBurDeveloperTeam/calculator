/* Tetris mobile controls, adapted from the supplied implementation. */
(() => {
    const canvas = document.getElementById('tetris');
    const guideButton = document.getElementById('mobile-guide-button');
    const holdButton = document.getElementById('mobile-hold-button');
    const guideModal = document.getElementById('mobile-guide-modal');
    const guideClose = document.getElementById('mobile-guide-close');
    if (!canvas) return;

    const SWIPE_STEP = 24;
    const TAP_MAX_MOVE = 14;
    const DOUBLE_TAP_DELAY = 260;
    const LONG_PRESS_DELAY = 300;
    const SOFT_DROP_INTERVAL = 55;

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let lastMoveX = 0;
    let pointerDownTime = 0;
    let moved = false;
    let longPressActive = false;
    let longPressTimer = null;
    let softDropTimer = null;
    let singleTapTimer = null;
    let lastTapTime = 0;
    let guidePausedGame = false;

    const canPlay = () => gameState.running && !gameState.paused && !gameState.isCountingDown;

    function updateHoldVisibility() {
        if (!holdButton) return;
        const visible = canPlay() && overlay.style.display === 'none';
        holdButton.classList.toggle('is-gameplay-visible', visible);
    }

    function clearLongPress() {
        if (longPressTimer) clearTimeout(longPressTimer);
        if (softDropTimer) clearInterval(softDropTimer);
        longPressTimer = null;
        softDropTimer = null;
    }

    function startSoftDrop() {
        if (!canPlay()) return;
        longPressActive = true;
        moveDown();
        softDropTimer = setInterval(() => {
            if (!canPlay()) return clearLongPress();
            moveDown();
        }, SOFT_DROP_INTERVAL);
    }

    function handleTap() {
        const now = performance.now();
        if (now - lastTapTime <= DOUBLE_TAP_DELAY) {
            if (singleTapTimer) clearTimeout(singleTapTimer);
            singleTapTimer = null;
            lastTapTime = 0;
            if (canPlay()) playerRotate(1);
            return;
        }
        lastTapTime = now;
        singleTapTimer = setTimeout(() => {
            if (canPlay()) hardDrop();
            singleTapTimer = null;
            lastTapTime = 0;
        }, DOUBLE_TAP_DELAY);
    }

    function onPointerDown(event) {
        if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
        if (!canPlay()) return;
        event.preventDefault();
        ensureAudio();
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        lastMoveX = event.clientX;
        pointerDownTime = performance.now();
        moved = false;
        longPressActive = false;
        canvas.setPointerCapture?.(event.pointerId);
        clearLongPress();
        longPressTimer = setTimeout(() => {
            if (!moved) startSoftDrop();
        }, LONG_PRESS_DELAY);
    }

    function onPointerMove(event) {
        if (pointerId === null || event.pointerId !== pointerId) return;
        event.preventDefault();
        const totalX = event.clientX - startX;
        const totalY = event.clientY - startY;
        if (Math.abs(totalX) > TAP_MAX_MOVE || Math.abs(totalY) > TAP_MAX_MOVE) {
            moved = true;
            if (longPressTimer) clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        if (Math.abs(totalX) <= Math.abs(totalY)) return;
        const deltaX = event.clientX - lastMoveX;
        if (Math.abs(deltaX) < SWIPE_STEP) return;
        if (canPlay()) deltaX > 0 ? moveRight() : moveLeft();
        lastMoveX = event.clientX;
    }

    function finishPointer(event) {
        if (pointerId === null || event.pointerId !== pointerId) return;
        event.preventDefault();
        const duration = performance.now() - pointerDownTime;
        const distanceX = Math.abs((event.clientX ?? startX) - startX);
        const distanceY = Math.abs((event.clientY ?? startY) - startY);
        const wasLongPress = longPressActive;
        clearLongPress();
        longPressActive = false;
        pointerId = null;
        if (wasLongPress || moved || distanceX > TAP_MAX_MOVE || distanceY > TAP_MAX_MOVE) return;
        if (duration < LONG_PRESS_DELAY) handleTap();
    }

    function cancelPointer(event) {
        if (pointerId !== null && event.pointerId !== pointerId) return;
        clearLongPress();
        longPressActive = false;
        pointerId = null;
    }

    function openGuide() {
        if (!guideModal) return;
        guidePausedGame = gameState.running && !gameState.paused;
        if (guidePausedGame) gameState.paused = true;
        clearLongPress();
        guideModal.setAttribute('aria-hidden', 'false');
        updateHoldVisibility();
    }

    function closeGuide() {
        if (!guideModal) return;
        guideModal.setAttribute('aria-hidden', 'true');
        if (guidePausedGame && gameState.running) {
            gameState.paused = false;
            gameState.lastTime = performance.now();
        }
        guidePausedGame = false;
        updateHoldVisibility();
        document.body.focus();
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', finishPointer);
    canvas.addEventListener('pointercancel', cancelPointer);
    canvas.addEventListener('lostpointercapture', cancelPointer);
    holdButton?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (canPlay()) holdCurrentPiece();
    });
    guideButton?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openGuide();
    });
    guideClose?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeGuide();
    });
    guideModal?.addEventListener('click', (event) => {
        if (event.target === guideModal) closeGuide();
    });

    const originalStartGame = startGame;
    startGame = function (...args) {
        const result = originalStartGame(...args);
        requestAnimationFrame(updateHoldVisibility);
        return result;
    };
    const originalStopGame = stopGame;
    stopGame = function (...args) {
        const result = originalStopGame(...args);
        clearLongPress();
        requestAnimationFrame(updateHoldVisibility);
        return result;
    };
    const originalShowOverlay = showOverlay;
    showOverlay = function (...args) {
        const result = originalShowOverlay(...args);
        requestAnimationFrame(updateHoldVisibility);
        return result;
    };
    const originalHideOverlay = hideOverlay;
    hideOverlay = function (...args) {
        const result = originalHideOverlay(...args);
        requestAnimationFrame(updateHoldVisibility);
        return result;
    };
    updateHoldVisibility();
})();
