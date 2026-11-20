import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavLink } from "@site/components/NavLink";
import { BASE, REPO } from "@site/components/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Three Viewport Gizmo", template: "%s · Three Viewport Gizmo" },
  description:
    "A view cube and orientation gizmo for three.js cameras, with WebGL and WebGPU support.",
  icons: { icon: `${BASE}/logo.svg` },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <header className="site-header">
          <nav aria-label="Main">
            <Link className="brand" href="/">
              <img src={`${BASE}/logo.svg`} alt="" width={24} height={24} />
              three-viewport-gizmo
            </Link>
            <NavLink href="/playground/">Playground</NavLink>
            <NavLink href="/matrix/">Matrix</NavLink>
            <NavLink href="/docs/" section>
              Guides
            </NavLink>
            <a href={REPO}>GitHub</a>
          </nav>
        </header>
        <main id="content">{children}</main>
        <footer className="site-footer">
          MIT licensed. Maintained by <a href="https://github.com/taucad">Tau</a> as a fork of{" "}
          <a href="https://github.com/Fennec-hub/three-viewport-gizmo">three-viewport-gizmo</a> by
          Fennec.
        </footer>
      </body>
    </html>
  );
}
