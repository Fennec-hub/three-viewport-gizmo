/** CSS pixels a press may travel along either axis and still be a click. */
export const clickSlop = 10;

/** Milliseconds between two clicks' presses for the second to make a double-click (G0 rule). */
export const doubleClickSpan = 400;

/** CSS pixels between two clicks' presses for the second to make a double-click (G0 rule). */
export const doubleClickReach = 5;

/**
 * Whether a pointer is still within the click slop of where it was pressed.
 *
 * @param e - The pointer now, in client pixels
 * @param start - Where it was pressed, in client pixels
 * @param threshold - The slop in CSS pixels
 * @returns True while the pointer has not left the slop box
 */
export const isClick = (
  e: Readonly<{ clientX: number; clientY: number }>,
  start: Readonly<{ x: number; y: number }>,
  threshold: number = clickSlop
) => Math.abs(e.clientX - start.x) < threshold && Math.abs(e.clientY - start.y) < threshold;

/** Where and when a click was pressed: `at` is the press's event `timeStamp` in milliseconds, `x` and `y` client pixels. */
export type ClickMark = Readonly<{ at: number; x: number; y: number }>;

/** The mark before any click, and after a double-click, so a third click starts over. */
export const noClick: ClickMark = Object.freeze({ at: -Infinity, x: NaN, y: NaN });

/**
 * Classifies a click against the previous one (roll ruling 3, G0 rule). A click is a double-click's second when
 * its press comes within {@link doubleClickSpan} of the previous click's press and within {@link doubleClickReach}
 * of the same spot, whatever target either press hits: the first click's turn moves a different target under a
 * still pointer, and a quick click elsewhere is a new target, not a double-click.
 *
 * @param previous - The mark the last classification returned, or {@link noClick}
 * @param click - This click's press
 * @returns Whether this click is a double-click's second, and the mark to compare the next click with
 */
export function classifyClick(previous: ClickMark, click: ClickMark): { double: boolean; next: ClickMark } {
  const double =
    click.at - previous.at < doubleClickSpan &&
    Math.hypot(click.x - previous.x, click.y - previous.y) < doubleClickReach;
  return { double, next: double ? noClick : click };
}
