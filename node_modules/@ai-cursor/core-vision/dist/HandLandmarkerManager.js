import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
export class HandLandmarkerManager {
    static async getInstance() {
        if (this.instance)
            return this.instance;
        // Memuat WebAssembly untuk MediaPipe
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        // Inisialisasi model Hand Tracking
        this.instance = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1 // Kita batasi 1 tangan saja untuk mengontrol kursor
        });
        return this.instance;
    }
}
HandLandmarkerManager.instance = null;
