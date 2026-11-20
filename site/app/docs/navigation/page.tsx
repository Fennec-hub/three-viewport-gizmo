import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";
import { CustomControlsExample, NavigationExample } from "./examples";
import "@site/samples/navigation.css";

export const metadata: Metadata = {
  title: "Navigation buttons",
  description: "Turn on the gizmo's built-in side, roll and Home buttons, choose which show, style them, or build your own.",
};

const BUTTONS: [name: string, label: string, shown: ReactNode][] = [
  ["up, left, right, down", "Turn to <face>", "At a face view, or during a flight to one. Turns upright to the face on that side of the screen"],
  [
    "roll-clockwise, roll-counterclockwise",
    "Roll view clockwise / counter-clockwise",
    <>
      At any target while <code>canRoll</code>; hidden whenever the resolved <code>roll</code> is <code>false</code>, as for a turntable. Rolls 90°
    </>,
  ],
  ["home", "Home view", "Always. Turns to Top Front Right, upright"],
];

const SWITCHES: [key: string, effect: ReactNode][] = [
  ["enabled", <>Default <code>false</code>: no node is added</>],
  ["sides", <>The four side triangles. Default <code>true</code></>],
  ["roll", <>The two roll arrows. Default <code>true</code></>],
  ["home", <>The Home button. Default <code>true</code></>],
  [
    "reveal",
    <>
      <code>&quot;hover&quot;</code> (default): while the pointer is over the element, focus is within it, or the
      device has no hover (<code>(hover: none)</code>, touch). <code>&quot;always&quot;</code>: always
    </>,
  ],
];

const VARIABLES: [name: string, fallback: string][] = [
  ["--viewport-gizmo-button-background", "The edge colour when edges are drawn, else background.color"],
  ["--viewport-gizmo-button-ring", "The Front face's colour (sphere: the up axis's colour)"],
  ["--viewport-gizmo-button-ring-hover", "The Front face's hover colour (sphere: the up axis's colour, darker)"],
  ["--viewport-gizmo-button-color", "The Front face's label colour"],
  ["--viewport-gizmo-button-focus-ring", "The Front face's hover colour (sphere: the up axis's colour, darker)"],
];

export default function NavigationGuide() {
  return (
    <>
      <h1>Navigation buttons</h1>
      <p>
        Give the cube buttons that turn the view to the neighbouring face, roll it a quarter turn and go home, as in
        CAD view cubes. They are off by default; the same turns are public API if you would rather draw your own.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>, with a <code>cube</code> or <code>rounded-cube</code>{" "}
        gizmo.
      </p>

      <h2>Steps</h2>
      <h3>1. Turn the buttons on and make room for them</h3>
      <p>
        The buttons are absolutely positioned <code>&lt;button&gt;</code>s in the gizmo&apos;s element, placed from the
        cube&apos;s silhouette, so they sit outside the element&apos;s box: on the default 128 px cube the chips reach
        about 13 px beyond it. Raise <code>offset</code> by 24 to 30 px so a container with{" "}
        <code>overflow: hidden</code> does not clip them.
      </p>
      <Sample file="navigation.ts" />
      <figure>
        <NavigationExample />
        <figcaption>
          Click a face: the side triangles and roll arrows appear around the cube. Drag the cube and they hide until
          the next click; Home stays.
        </figcaption>
      </figure>

      <h3>2. Choose what shows</h3>
      <p>
        Every button is hidden while not offered or not revealed, and all of them while <code>enabled</code> is{" "}
        <code>false</code>. Each press goes through <code>turn</code> or <code>lookFrom</code> with cause{" "}
        <code>navigation</code>.
      </p>
      <table>
        <thead>
          <tr>
            <th>
              <code>data-navigation</code>
            </th>
            <th>Accessible name</th>
            <th>Shown</th>
          </tr>
        </thead>
        <tbody>
          {BUTTONS.map(([name, label, shown]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{label}</td>
              <td>{shown}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        The <code>navigation</code> option switches them:
      </p>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          {SWITCHES.map(([key, effect]) => (
            <tr key={key}>
              <td>
                <code>{key}</code>
              </td>
              <td>{effect}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>3. Style them</h3>
      <p>
        The library injects no stylesheet. Set these custom properties on the element (or any ancestor); each falls
        back to the cube&apos;s own style, so a restyled cube restyles its buttons. A hovered button has{" "}
        <code>data-hovered</code>, and the element carries <code>--viewport-gizmo-anchor</code>, the distance in CSS
        pixels from its centre to the side buttons, and <code>--viewport-gizmo-anchor-corner</code>, the corner
        buttons&apos; distance along each axis (the same on a cube, closer on the round sphere).
      </p>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Fallback</th>
          </tr>
        </thead>
        <tbody>
          {VARIABLES.map(([name, fallback]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{fallback}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Sample file="navigation.css" label="navigation.css" />
      <figure>
        <Stage
          label="Cube gizmo with restyled navigation buttons"
          config={{
            controller: "orbit",
            gizmo: {
              type: "cube",
              className: "nav-cube",
              offset: { top: 36, right: 36 },
              navigation: { enabled: true, reveal: "always" },
            },
          }}
        />
        <figcaption>The same buttons with the variables above, always revealed.</figcaption>
      </figure>

      <h3>4. Operate them from the keyboard</h3>
      <p>
        The buttons follow the gizmo&apos;s element in the tab order, row by row: roll clockwise, up, roll
        counter-clockwise, left, right, down, Home. With <code>reveal: &quot;hover&quot;</code>, focusing the element
        reveals them. <kbd>Enter</kbd> or <kbd>Space</kbd> presses the focused button; the arrows and{" "}
        <kbd>Shift</kbd> + arrows on a focused button still drive the gizmo, as in{" "}
        <Link href="/docs/keyboard/">Keyboard and accessibility</Link>. Each button has a 24 px hit area.
      </p>

      <h2>Variations</h2>
      <h3>Your own controls</h3>
      <p>
        Leave <code>navigation</code> off and call the same turns. <code>atTarget</code> is the target the view rests on
        (null while dragging, flying and after a free drag); at a face its <code>sides</code> name the face each side
        turn goes to. <code>attargetchange</code> fires whenever it changes. <code>canRoll</code> changes only through{" "}
        <code>set()</code> or <code>attachControls()</code>, so read it there.
      </p>
      <Sample file="navigation-custom.ts" />
      <figure>
        <CustomControlsExample />
        <figcaption>
          Buttons outside the viewport: click a face on the cube, then turn, roll and go home from the toolbar.
        </figcaption>
      </figure>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/keyboard/">Keyboard and accessibility</Link>
        </li>
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
