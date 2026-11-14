export const getDomElement = (
  domElement: string | HTMLElement
): HTMLElement => {
  const element =
    typeof domElement === "string"
      ? document.querySelector<HTMLElement>(domElement)
      : domElement;

  if (!element) throw Error(`Invalid DOM element`);

  return element;
};
