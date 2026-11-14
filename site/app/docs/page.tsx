import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@site/components/site";

export const metadata: Metadata = { title: "Guides" };

export default function GuidesIndex() {
  return (
    <>
      <h1>Guides</h1>
      <p>Each guide is a short explanation, the code, and the same code running live.</p>
      <ul>
        {GUIDES.map(({ slug, title }) => (
          <li key={slug}>
            <Link href={`/docs/${slug}/`}>{title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
