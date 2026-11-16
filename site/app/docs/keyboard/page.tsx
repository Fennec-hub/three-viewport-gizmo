import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = {
  title: "Keyboard and accessibility",
  description: "The gizmo's key map, focus, role and accessible name, and how to keep your own shortcuts.",
};

const KEYS: [keys: ReactNode, action: ReactNode][] = [
  [
    <>
      <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>
    </>,
    "Step 45° to the neighbouring target on that side of the screen: from a face to its edge, from an edge to a face or corner",
  ],
  [
    <>
      <kbd>1</kbd> to <kbd>6</kbd>
    </>,
    "Front, Back, Left, Right, Top, Bottom (the top row or the keypad)",
  ],
  [<kbd key="home">Home</kbd>, "Home: Top Front Right, upright"],
  [
    <>
      <kbd>Shift</kbd> + <kbd>→</kbd> / <kbd>←</kbd>
    </>,
    <>
      Roll 90° clockwise / counter-clockwise, only while <code>canRoll</code>
    </>,
  ],
];

const ATTRIBUTES: [name: string, value: ReactNode][] = [
  ["role", <code key="r">application</code>],
  [
    "aria-roledescription",
    <>
      <code>view cube</code>, or <code>view sphere</code> for the sphere
    </>,
  ],
  [
    "aria-label",
    <>
      The view: the target&apos;s label (&quot;Top Front Right&quot;; axis letters on the sphere), with
      &quot;, rolled 90° clockwise&quot;, &quot;, rolled 180°&quot; or &quot;, rolled 90° counter-clockwise&quot;
      when rolled; &quot;Near&quot; and the nearest target between targets
    </>,
  ],
  [
    "tabindex",
    <>
      <code>0</code>; <code>-1</code> with <code>aria-disabled=&quot;true&quot;</code> while{" "}
      <code>enabled</code> is <code>false</code>
    </>,
  ],
];

export default function KeyboardGuide() {
  return (
    <>
      <h1>Keyboard and accessibility</h1>
      <p>
        The gizmo&apos;s element is a tab stop that turns the view from the keyboard and names the view
        for assistive technology. There is no option to switch it: <code>enabled</code> switches pointer
        and keyboard together.
      </p>

      <h2>Key map</h2>
      <p>
        Keys work while the element has focus and <code>enabled</code> is <code>true</code>. Every turn
        goes through <code>lookFrom</code> or <code>turn</code> with cause <code>key</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Keys</th>
            <th>Turn</th>
          </tr>
        </thead>
        <tbody>
          {KEYS.map(([keys, action], index) => (
            <tr key={index}>
              <td>{keys}</td>
              <td>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        A press with <kbd>Ctrl</kbd>, <kbd>Meta</kbd> or <kbd>Alt</kbd>, during IME composition, or of
        any other key is left to the page. A key the gizmo takes is <code>preventDefault</code>ed and
        still bubbles.
      </p>

      <h2>Element</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTES.map(([name, value]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        A visually hidden <code>role=&quot;status&quot;</code> first child announces the name once when a
        key turn reaches its view. A pointer press does not move focus. The library draws no focus ring:
        style <code>:focus-visible</code> on the element, as in{" "}
        <Link href="/docs/styling/">Styling and state</Link>.
      </p>

      <h2>Usage</h2>
      <p>Keep your own shortcuts from firing on keys the gizmo took:</p>
      <Sample file="keyboard.ts" />
      <figure>
        <Stage label="Cube gizmo operated from the keyboard" config={{ controller: "orbit", gizmo: { type: "cube" } }} />
        <figcaption>
          Tab to the cube, then use the arrows, <kbd>1</kbd> to <kbd>6</kbd>, <kbd>Home</kbd> and{" "}
          <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd>.
        </figcaption>
      </figure>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/styling/">Styling and state</Link>
        </li>
        <li>
          <Link href="/docs/api/#methods">API reference: lookFrom and turn</Link>
        </li>
      </ul>
    </>
  );
}
