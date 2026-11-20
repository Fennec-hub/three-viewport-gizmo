import type { ReactNode } from "react";
import { NavLink } from "@site/components/NavLink";
import { GUIDES } from "@site/components/site";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs">
      <nav className="docs-nav" aria-label="Guides">
        <ul>
          {GUIDES.map(({ slug, title }) => (
            <li key={slug}>
              <NavLink href={`/docs/${slug}/`}>{title}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <article className="prose">{children}</article>
    </div>
  );
}
