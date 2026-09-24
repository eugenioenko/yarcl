/** Retries `fn` until it returns a truthy value, for state that settles a moment after an action. */
export async function poll(fn, tries = 20) {
  let value;
  for (let i = 0; i < tries && !(value = await fn()); i++) await new Promise((r) => setTimeout(r, 50));
  return value;
}
