/**
 * An error meant for the volunteer who caused it, not for whoever wrote the
 * code that found it.
 *
 * Astro prints a "Stack trace:" block for any error that carries one, and every
 * frame of these is inside node_modules or a bundled chunk: file:// URLs, a
 * .mjs name with a hash in it, line and column numbers. None of it is a place
 * an editor can go and nothing in it is a thing they can do, and it is the part
 * of a failed-build email that persuades somebody this is not for them. An
 * empty stack is what makes Astro print the sentence and stop.
 */
export function editorError(message: string): Error {
  const error = new Error(message);
  error.stack = '';
  return error;
}
