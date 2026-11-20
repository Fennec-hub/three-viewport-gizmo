"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** A link that marks itself `aria-current="page"` (exact) or for a section prefix. */
export function NavLink({ href, section, children }: { href: string; section?: boolean; children: ReactNode }) {
  const path = usePathname().replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  const current = section ? path.startsWith(target) : path === target;
  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
