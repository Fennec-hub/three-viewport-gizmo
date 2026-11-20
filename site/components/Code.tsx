import { codeToHtml } from "shiki";

export type CodeLanguage = "ts" | "css" | "bash";

/**
 * A code block, highlighted at build time (server components only; nothing ships to the browser). Both themes are
 * emitted as CSS variables and `globals.css` picks one per colour scheme. Scrollable regions are focusable so
 * keyboard users can scroll them.
 */
export async function Code({
  children,
  label = "Code",
  lang = "ts",
}: {
  children: string;
  label?: string;
  lang?: CodeLanguage;
}) {
  const html = await codeToHtml(children.trim(), {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      {
        pre(node) {
          node.properties.tabindex = 0;
          node.properties["aria-label"] = label;
          delete node.properties.style;
        },
      },
    ],
  });
  return <div className="code" dangerouslySetInnerHTML={{ __html: html }} />;
}
