type Bag = Record<string, unknown>;

function bag(value: unknown): Bag {
  return (value ?? {}) as Bag;
}

/** Core returns the raw node, or {node}, or {mother,children} depending on the route. */
export function idOf(body: unknown): string {
  const data = bag(body);
  const candidate =
    data.id ?? bag(data.node).id ?? bag(data.mother).id ?? bag(data.root).id;
  return String(candidate);
}

export function contentIds(body: unknown): string[] {
  const content = bag(body).content;
  const items = Array.isArray(content) ? content : [];
  return items.map((item) => {
    const entry = bag(item);
    return String(entry.id ?? bag(entry.node).id);
  });
}

export function balanceOf(body: unknown): number {
  return Number(bag(body).balance);
}
