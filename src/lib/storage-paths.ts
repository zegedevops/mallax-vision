import path from "node:path";

export function demoImageDir() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "mallax-demo");
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public", "demo");
}

export function merchantStorePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "registered-merchants.json");
  }
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "data",
    "registered-merchants.json",
  );
}

export function isAllowedReferencePath(filePath: string) {
  const resolved = path.resolve(filePath);
  const roots = [
    path.resolve(/* turbopackIgnore: true */ process.cwd(), "public", "demo"),
    path.resolve("/tmp", "mallax-demo"),
  ];
  return roots.some(
    (root) => resolved === root || resolved.startsWith(`${root}${path.sep}`),
  );
}
