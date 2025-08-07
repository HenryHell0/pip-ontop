import Meta from 'gi://Meta';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
const { GLib } = imports.gi;

export default class PiPExtension extends Extension {
    enable() {
        log('[pip-ontop] Enabled!!!!');

        this._handlerId = global.display.connect('window-created', (display, window) => {
            log("[pip-ontop] any sort of window opened!");
            this._checkWindow(window);
        });

        // Check already open windows
        for (const actor of global.get_window_actors()) {
            this._checkWindow(actor.meta_window);
        }
    }

    disable() {
        log('[pip-ontop] Disabled!');

        if (this._handlerId) {
            global.display.disconnect(this._handlerId);
            this._handlerId = null;
        }
    }

    _checkWindow(win, attempt = 0) {
        try {
            const title = win.get_title();
            const app = win.get_wm_class(); // This gives us "Google-chrome"


            log(`[pip-ontop] Window detected: title="${title}", class="${app}"`);


            if (!title) {
                if (attempt < 10) {

                    // Try again in 200ms
                    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
                        this._checkWindow(win, attempt + 1);
                        return GLib.SOURCE_REMOVE;
                    });
                    return;
                } else {
                    log(`[pip-ontop] Gave up on window after 5 attempts`);
                    return;
                }
            }


            log(`[pip-ontop] Window detected: title="${title}", class="${app}"`);



            if (
                // title.toLowerCase() === 'picture in picture' &&
                // app.toLowerCase().includes('chrome')
                title.toLowerCase() === 'picture in picture'
            ) {
                log('[pip-ontop] Found PiP window! Making it always on top.');
                win.make_above();
            }
        } catch (e) {
            logError(e, '[pip-ontop] Failed to check window');
        }
    }
}