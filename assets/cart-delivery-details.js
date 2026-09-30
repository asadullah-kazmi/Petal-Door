import { Component } from '@theme/component';

const UAE_OFFSET_HOURS = 4; // Gulf Standard Time, no daylight saving
const DAY = 86_400_000;

/**
 * Delivery details in the cart: emirate, date, time slot, gift message.
 * Each field posts to the cart form as a cart attribute and is also saved
 * immediately with /cart/update.js so values survive cart re-renders.
 *
 * @typedef {object} DeliveryRefs
 * @property {HTMLSelectElement} emirate
 * @property {HTMLElement} emirateHint
 * @property {HTMLInputElement} dateToday
 * @property {HTMLInputElement} dateTomorrow
 * @property {HTMLInputElement} dateOther
 * @property {HTMLInputElement} date
 * @property {HTMLElement} dateError
 * @property {HTMLInputElement[]} slots
 * @property {HTMLTextAreaElement} message
 * @property {HTMLElement} charsLeft
 * @property {HTMLElement} error
 *
 * @extends {Component<DeliveryRefs>}
 */
class CartDeliveryDetails extends Component {
  requiredRefs = ['emirate', 'dateToday', 'dateTomorrow', 'dateOther', 'date', 'message', 'error'];

  /** @type {number | undefined} */
  #saveTimer;

  /** True while the shopper is choosing a custom date. */
  #pickingOther = false;

  connectedCallback() {
    super.connectedCallback();
    this.#initDate();
    this.#refresh();
    this.#updateCharsLeft();
    document.addEventListener('submit', this.#onSubmit, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('submit', this.#onSubmit, true);
  }

  /* ---------- event handlers (bound via on:* attributes) ---------- */

  onEmirateChange() {
    // If the chosen date is no longer allowed for this emirate, clear it.
    if (this.refs.date.value && this.refs.date.value < this.#minDate()) this.#setDate('');
    this.#refresh();
    this.#save();
  }

  /** @param {Event} event */
  onDateChoice(event) {
    const { value } = /** @type {HTMLInputElement} */ (event.target);
    this.#pickingOther = value === 'other';
    if (this.#pickingOther) {
      this.refs.date.hidden = false;
      this.refs.date.showPicker?.();
      return;
    }
    this.#setDate(this.#storeDate(Number(value)));
    this.#refresh();
    this.#save();
  }

  onDateInput() {
    this.#refresh();
    this.#save();
  }

  onChange() {
    this.#refresh();
    this.#save();
  }

  onMessageInput() {
    this.#updateCharsLeft();
    this.#save(800);
  }

  /* ---------- dates & slots ---------- */

  /** Today's date in UAE time, shifted by `days`, as YYYY-MM-DD. */
  #storeDate(days = 0) {
    return new Date(Date.now() + UAE_OFFSET_HOURS * 3_600_000 + days * DAY).toISOString().slice(0, 10);
  }

  #storeHour() {
    const now = new Date(Date.now() + UAE_OFFSET_HOURS * 3_600_000);
    return now.getUTCHours() + now.getUTCMinutes() / 60;
  }

  #emirateMinDays() {
    const option = this.refs.emirate.selectedOptions[0];
    return Number(option?.dataset.minDays || 0);
  }

  #minDate() {
    const firstBookable = this.#availableSlots(this.#storeDate(0)).length ? 0 : 1;
    return this.#storeDate(Math.max(this.#emirateMinDays(), firstBookable));
  }

  #isClosed(date) {
    return (this.dataset.closedDates || '').split(',').includes(date);
  }

  /** Slots still bookable on the given date. */
  #availableSlots(date) {
    const slots = this.refs.slots || [];
    if (date !== this.#storeDate(0)) return slots;
    const cutoff = this.#storeHour() + Number(this.dataset.leadHours || 2);
    return slots.filter((slot) => Number(slot.dataset.end) >= cutoff);
  }

  #initDate() {
    const { date } = this.refs;
    date.min = this.#storeDate(0);
    date.max = this.#storeDate(Number(this.dataset.maxDays || 30));
    // Drop a stale date saved on an earlier visit.
    if (date.value && date.value < this.#storeDate(0)) this.#setDate('');
  }

  /** @param {string} value */
  #setDate(value) {
    this.refs.date.value = value;
  }

  /** Sync every control's enabled/checked state with the current selection. */
  #refresh() {
    const { date, dateToday, dateTomorrow, dateOther, emirateHint, dateError } = this.refs;
    const minDays = this.#emirateMinDays();
    const today = this.#storeDate(0);
    const tomorrow = this.#storeDate(1);

    date.min = this.#minDate();
    dateToday.disabled = minDays > 0 || this.#isClosed(today) || this.#availableSlots(today).length === 0;
    dateTomorrow.disabled = minDays > 1 || this.#isClosed(tomorrow);
    if (emirateHint) emirateHint.hidden = !(this.refs.emirate.value && minDays > 0);

    // Reflect the chosen date on the chips.
    dateToday.checked = date.value === today && !dateToday.disabled;
    dateTomorrow.checked = date.value === tomorrow && !dateTomorrow.disabled;
    dateOther.checked = this.#pickingOther || (Boolean(date.value) && !dateToday.checked && !dateTomorrow.checked);
    date.hidden = !dateOther.checked;

    this.toggleAttribute('data-no-date', !date.value);
    const closed = Boolean(date.value) && this.#isClosed(date.value);
    if (dateError) dateError.hidden = !closed;

    const available = new Set(date.value && !closed ? this.#availableSlots(date.value) : []);
    for (const slot of this.refs.slots || []) {
      slot.disabled = !available.has(slot);
      if (slot.disabled) slot.checked = false;
    }

    const complete = this.#isComplete();
    this.toggleAttribute('data-complete', complete);
    if (complete) {
      this.refs.error.hidden = true;
      this.removeAttribute('data-invalid');
    }
  }

  #isComplete() {
    const { emirate, date } = this.refs;
    const slot = (this.refs.slots || []).find((s) => s.checked);
    return Boolean(emirate.value && date.value && !this.#isClosed(date.value) && date.value >= this.#minDate() && slot);
  }

  #updateCharsLeft() {
    const { message, charsLeft } = this.refs;
    if (!charsLeft) return;
    const left = message.maxLength - message.value.length;
    charsLeft.textContent = (this.dataset.charsLeft || '[count]').replace('[count]', String(left));
  }

  /* ---------- persistence & checkout guard ---------- */

  #attributes() {
    const slot = (this.refs.slots || []).find((s) => s.checked);
    const updates = /** @type {HTMLInputElement | null} */ (this.querySelector('input[name="attributes[Order Updates]"]:checked'));
    return {
      'Delivery Emirate': this.refs.emirate.value,
      'Delivery Date': this.refs.date.value,
      'Delivery Time': slot?.value || '',
      'Gift Message': this.refs.message.value,
      ...(updates ? { 'Order Updates': updates.value } : {}),
    };
  }

  /** @param {number} [delay] */
  #save(delay = 0) {
    window.clearTimeout(this.#saveTimer);
    this.#saveTimer = window.setTimeout(() => {
      fetch(`${window.Shopify?.routes?.root || '/'}cart/update.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ attributes: this.#attributes() }),
      }).catch(() => {
        /* Values are still posted with the cart form at checkout. */
      });
    }, delay);
  }

  /** Block checkout until the delivery details are complete. */
  #onSubmit = (/** @type {SubmitEvent} */ event) => {
    const form = /** @type {HTMLFormElement} */ (event.target);
    if (form.id !== 'cart-form' || this.dataset.required !== 'true') return;
    if (event.submitter?.getAttribute('name') !== 'checkout') return;

    this.#refresh();
    if (this.#isComplete()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    this.refs.error.hidden = false;
    this.setAttribute('data-invalid', '');
    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (this.refs.emirate.value ? this.refs.dateToday : this.refs.emirate).focus({ preventScroll: true });
  };
}

if (!customElements.get('cart-delivery-details')) {
  customElements.define('cart-delivery-details', CartDeliveryDetails);
}
