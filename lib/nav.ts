export function isBrowsePath(path: string) {
  const current = path.replace(/\/$/, "") || "/";
  return (
    current === "/" ||
    current === "/guide" ||
    current === "/tonight" ||
    current === "/calendar" ||
    current === "/items" ||
    current === "/watch" ||
    current.startsWith("/live/")
  );
}
