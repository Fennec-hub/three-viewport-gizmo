/** A code block; scrollable regions are focusable so keyboard users can scroll them. */
export function Code({ children, label = "Code" }: { children: string; label?: string }) {
  return (
    <pre tabIndex={0} aria-label={label}>
      <code>{children.trim()}</code>
    </pre>
  );
}
