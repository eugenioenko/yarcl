const wait = globalThis.setTimeout.bind(globalThis);

/** Retries `fn` until it returns a truthy value, for state that settles a moment after an action. Unaffected by a faked clock. */
export async function poll(fn, tries = 20) {
  let value;
  for (let i = 0; i < tries && !(value = await fn()); i++) await new Promise((r) => wait(r, 50));
  return value;
}
