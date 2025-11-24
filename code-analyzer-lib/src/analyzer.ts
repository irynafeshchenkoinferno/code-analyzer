export function analyzeCode(code: string) {
  const lines = code.split("\n").length;
  const functions = (code.match(/function\s+\w+/g) || []).length;

  return { lines, functions };
}
