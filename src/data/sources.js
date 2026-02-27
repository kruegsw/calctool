// Source reference loader

let sourcesData = null;

export async function loadSources() {
  if (sourcesData) return sourcesData;
  const resp = await fetch(new URL('./sources.json', import.meta.url));
  sourcesData = await resp.json();
  return sourcesData;
}

export function getSources() {
  return sourcesData;
}
