import { Component } from '@theme/component';

/**
 * Shows the time left to order for same-day delivery, counted in the store's
 * time zone (UAE, UTC+4) regardless of the shopper's device time zone.
 *
 * @typedef {object} DeliveryCountdownRefs
 * @property {HTMLElement} before - Message shown before the cutoff
 * @property {HTMLElement} after - Message shown after the cutoff
 * @property {HTMLElement} time - Element that receives the remaining time
 *
 * @extends {Component<DeliveryCountdownRefs>}
 */
class DeliveryCountdown extends Component {
  requiredRefs = ['before', 'after', 'time'];

  /** @type {number | undefined} */
  #timer;

  connectedCallback() {
    super.connectedCallback();
    this.#update();
    this.#timer = window.setInterval(() => this.#update(), 30_000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this.#timer);
  }

  #update() {
    const cutoffHour = Number(this.dataset.cutoffHour);
    const offsetHours = 4; // Gulf Standard Time (UTC+4), no daylight saving
    const now = Date.now();

    // Wall-clock time in the store's zone, expressed as a UTC date for easy maths.
    const storeNow = new Date(now + offsetHours * 3_600_000);
    const cutoff = Date.UTC(storeNow.getUTCFullYear(), storeNow.getUTCMonth(), storeNow.getUTCDate(), cutoffHour);
    const remainingMinutes = Math.ceil((cutoff - storeNow.getTime()) / 60_000);

    const beforeCutoff = remainingMinutes > 0;
    this.refs.before.hidden = !beforeCutoff;
    this.refs.after.hidden = beforeCutoff;

    if (beforeCutoff) {
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      this.refs.time.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    this.dataset.ready = '';
  }
}

if (!customElements.get('delivery-countdown')) {
  customElements.define('delivery-countdown', DeliveryCountdown);
}
