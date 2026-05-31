import { FaceLandmarkerManager } from '@ai-cursor/core-vision';
import { GestureEngine } from '@ai-cursor/gesture-engine';
import { CursorController } from '@ai-cursor/input-mapper';

const video = document.getElementById('webcam') as HTMLVideoElement;
const cursor = document.getElementById('cursor') as HTMLDivElement;

// State kursor di layar
let currentCursorX: number = window.innerWidth / 2;
let currentCursorY: number = window.innerHeight / 2;

// State Pewaktuan untuk Klik
let lastClickTime = 0;
let clickTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Fungsi Mengeksekusi Klik Sungguhan pada UI Web
 * Digunakan oleh Single Blink dan Double Blink
 */
function executeRealClick(source: string) {
    const now = Date.now();
    const timeDiff = now - lastClickTime;

    const elementToClick = document.elementFromPoint(currentCursorX, currentCursorY) as HTMLElement;
    
    // Feedback visual kursor (Animasi Cyberpunk)
    cursor.classList.add('click-anim');
    setTimeout(() => cursor.classList.remove('click-anim'), 150);

    if (!elementToClick) return;

    if (timeDiff < 450 && timeDiff > 0) {
        // --- DOUBLE CLICK ---
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        
        const dblClickEvent = new MouseEvent('dblclick', {
            view: window, bubbles: true, cancelable: true,
            clientX: currentCursorX, clientY: currentCursorY
        });
        elementToClick.dispatchEvent(dblClickEvent);
        console.log(`🖱️ [${source}] DOUBLE CLICK Executed!`);
        lastClickTime = 0; 
    } else {
        // --- SINGLE CLICK ---
        lastClickTime = now;
        if (clickTimeout) clearTimeout(clickTimeout);
        
        clickTimeout = setTimeout(() => {
            const clickEvent = new MouseEvent('click', {
                view: window, bubbles: true, cancelable: true,
                clientX: currentCursorX, clientY: currentCursorY
            });
            elementToClick.dispatchEvent(clickEvent);

            // Trigger manual untuk link di Flizzy Dashboard
            const parentAnchor = elementToClick.closest('a');
            if (parentAnchor && parentAnchor.target === '_blank') {
                window.open(parentAnchor.href, '_blank');
            }

            console.log(`🖱️ [${source}] SINGLE CLICK Executed on:`, elementToClick.tagName);
            clickTimeout = null;
        }, 450); 
    }
}

async function initAI() {
    console.log("Flizzy OS: Loading Face-Only Neural Engine...");
    
    // Hanya memuat model Wajah
    const faceLandmarker = await FaceLandmarkerManager.getInstance();
    
    const cursorController = new CursorController({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Sinkronisasi ulang koordinat saat jendela di-resize
    window.addEventListener('resize', () => {
        cursorController.updateBounds({
            width: window.innerWidth,
            height: window.innerHeight
        });
    });

    const gestureEngine = new GestureEngine((action, data) => {
        if (action === 'move' && data) {
            // Mapping koordinat dari CursorController
            const safeYaw = data.yaw ?? 0;
            const safePitch = data.pitch ?? 0;
            const safeTimestamp = data.timestampMs ?? performance.now();

            const coords = cursorController.applyMovement(safeYaw, safePitch, safeTimestamp);
            
            // Update Global State & DOM
            currentCursorX = coords.x;
            currentCursorY = coords.y;
            
            cursor.style.left = `${currentCursorX}px`;
            cursor.style.top = `${currentCursorY}px`;

        } else if (action === 'click') {
            executeRealClick('face_blink');
        }
    });

    // Akses Kamera
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: 640, 
            height: 480, 
            frameRate: { ideal: 30 } 
        } 
    });
    video.srcObject = stream;

    video.addEventListener('loadeddata', () => {
        console.log("OS System Ready. SITTING STILL for Calibration...");
        let lastVideoTime = -1;

        function predictWebcam() {
            let startTimeMs = performance.now();
            if (lastVideoTime !== video.currentTime) {
                lastVideoTime = video.currentTime;
                
                const faceResults = faceLandmarker.detectForVideo(video, startTimeMs);
                
                if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
                    // Berikan data ke engine untuk diolah menjadi yaw/pitch
                    gestureEngine.processFaceFrame(faceResults.faceLandmarks[0] as any, startTimeMs);
                }
            }
            requestAnimationFrame(predictWebcam);
        }
        predictWebcam();
    });
}

// Jalankan sistem
initAI().catch(err => {
    console.error("Critical Neural Error:", err);
});