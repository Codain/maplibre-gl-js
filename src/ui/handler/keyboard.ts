import {Handler} from '../handler_manager';
import type {Map} from '../map';
import {TransformProvider} from './transform-provider';

const defaultOptions = {
    panStep: 100,
    bearingStep: 15,
    pitchStep: 10
};

/**
 * The `KeyboardHandler` allows the user to zoom, rotate, and pan the map using
 * the following keyboard shortcuts:
 *
 * - `=` / `+`: Increase the zoom level by 1.
 * - `Shift-=` / `Shift-+`: Increase the zoom level by 2.
 * - `-`: Decrease the zoom level by 1.
 * - `Shift--`: Decrease the zoom level by 2.
 * - Arrow keys: Pan by 100 pixels.
 * - `Shift+⇢`: Increase the rotation by 15 degrees.
 * - `Shift+⇠`: Decrease the rotation by 15 degrees.
 * - `Shift+⇡`: Increase the pitch by 10 degrees.
 * - `Shift+⇣`: Decrease the pitch by 10 degrees.
 */
export class KeyboardHandler implements Handler {
    _tr: TransformProvider;
    _enabled: boolean;
    _active: boolean;
    _panStep: number;
    _bearingStep: number;
    _pitchStep: number;
    _rotationDisabled: boolean;

    /**
    * @private
    */
    constructor(map: Map) {
        this._tr = new TransformProvider(map);
        const stepOptions = defaultOptions;
        this._panStep = stepOptions.panStep;
        this._bearingStep = stepOptions.bearingStep;
        this._pitchStep = stepOptions.pitchStep;
        this._rotationDisabled = false;
    }

    reset() {
        this._active = false;
    }

    keydown(e: KeyboardEvent) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;

        let zoomDir = 0;
        let bearingDir = 0;
        let pitchDir = 0;
        let xDir = 0;
        let yDir = 0;

        switch (e.keyCode) {
            case 61:
            case 107:
            case 171:
            case 187:
                zoomDir = 1;
                break;

            case 189:
            case 109:
            case 173:
                zoomDir = -1;
                break;

            case 37:
                if (e.shiftKey) {
                    bearingDir = -1;
                } else {
                    e.preventDefault();
                    xDir = -1;
                }
                break;

            case 39:
                if (e.shiftKey) {
                    bearingDir = 1;
                } else {
                    e.preventDefault();
                    xDir = 1;
                }
                break;

            case 38:
                if (e.shiftKey) {
                    pitchDir = 1;
                } else {
                    e.preventDefault();
                    yDir = -1;
                }
                break;

            case 40:
                if (e.shiftKey) {
                    pitchDir = -1;
                } else {
                    e.preventDefault();
                    yDir = 1;
                }
                break;

            default:
                return;
        }

        if (this._rotationDisabled) {
            bearingDir = 0;
            pitchDir = 0;
        }

        return {
            cameraAnimation: (map: Map) => {
                const tr = this._tr;
                map.easeTo({
                    duration: 300,
                    easeId: 'keyboardHandler',
                    easing: easeOut,

                    zoom: zoomDir ? Math.round(tr.zoom) + zoomDir * (e.shiftKey ? 2 : 1) : tr.zoom,
                    bearing: tr.bearing + bearingDir * this._bearingStep,
                    pitch: tr.pitch + pitchDir * this._pitchStep,
                    offset: [-xDir * this._panStep, -yDir * this._panStep],
                    center: tr.center
                }, {originalEvent: e});
            }
        };
    }

    /**
     * Enables the "keyboard rotate and zoom" interaction.
     *
     * @example
     *   map.keyboard.enable();
     */
    enable() {
        this._enabled = true;
    }

    /**
     * Disables the "keyboard rotate and zoom" interaction.
     *
     * @example
     *   map.keyboard.disable();
     */
    disable() {
        this._enabled = false;
        this.reset();
    }

    /**
     * Returns a Boolean indicating whether the "keyboard rotate and zoom"
     * interaction is enabled.
     *
     * @returns {boolean} `true` if the "keyboard rotate and zoom"
     * interaction is enabled.
     */
    isEnabled() {
        return this._enabled;
    }

    /**
     * Returns true if the handler is enabled and has detected the start of a
     * zoom/rotate gesture.
     *
     * @returns {boolean} `true` if the handler is enabled and has detected the
     * start of a zoom/rotate gesture.
     */
    isActive() {
        return this._active;
    }

    /**
     * Disables the "keyboard pan/rotate" interaction, leaving the
     * "keyboard zoom" interaction enabled.
     *
     * @example
     *   map.keyboard.disableRotation();
     */
    disableRotation() {
        this._rotationDisabled = true;
    }

    /**
     * Enables the "keyboard pan/rotate" interaction.
     *
     * @example
     *   map.keyboard.enable();
     *   map.keyboard.enableRotation();
     */
    enableRotation() {
        this._rotationDisabled = false;
    }
}

function easeOut(t: number) {
    return t * (2 - t);
}
