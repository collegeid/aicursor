export interface ScreenBounds {
    width: number;
    height: number;
}
export type CursorAction = 'move' | 'click' | 'double_click' | 'drag_start' | 'drag_end';
export interface CursorEvent {
    action: CursorAction;
    x: number;
    y: number;
}
export declare class CursorController {
    private bounds;
    private filterX;
    private filterY;
    currentX: number;
    currentY: number;
    private isFaceCalibrated;
    private centerYaw;
    private centerPitch;
    private faceSpeed;
    /** * DEADZONE ditingkatkan ke 0.05
     * Ini mengunci kursor agar diam mutlak saat wajah lurus
     */
    private deadzone;
    private blinkThreshold;
    private blinkCooldown;
    private doubleBlinkWindow;
    private lastBlinkTime;
    private lastEyeClosed;
    private blinkCount;
    constructor(bounds: ScreenBounds);
    private initFilters;
    private resetToCenter;
    updateBounds(newBounds: ScreenBounds): void;
    /**
     * HANDLE: FACE MOVEMENT
     * Fungsi utama untuk menggerakkan kursor dengan wajah
     */
    applyMovement(yaw: number, pitch: number, timestampMs: number): CursorEvent;
    /**
     * CORE: Engine Pergerakan Relatif Anti-Meluncur
     */
    private processRelativeMovement;
    /**
     * FACE CLICK: Deteksi Kedipan (Blink)
     */
    detectBlink(ear: number, timestampMs: number): CursorEvent | null;
    /** * Reset Kalibrasi secara manual
     */
    resetCalibration(): void;
}
