// An event kept in a folder inside src/content/events cannot be published, and
// used to take the build down in a way nobody could act on.
//
// src/pages/events/[slug].astro is a single-segment route: getStaticPaths()
// hands it one `slug` per event and Astro builds /events/<slug>. The id Astro
// gives an entry is its path under the collection folder, so an event saved at
// events/2027/rising.md has the id "2027/rising", which is not a value a
// one-segment route can take. Astro accepts the path, starts rendering the page
// and then throws `TypeError: Missing parameter: slug` from inside its own
// router — an error with a stack trace, no file name in it and nothing an
// editor can do about it. Reproduced on Astro 7 before this check existed.
//
// Nothing in the CMS produces such a folder: `.pages.yml` gives the events
// collection a fixed `path` and a `filename` with no folder in it, so every
// entry it writes lands directly in src/content/events. A folder there is
// therefore something a person made by hand, and refusing it in words is both
// cheaper and safer than widening the route to [...slug], which would give
// those events a URL shape no other event on the site has.

/** Turns a listing entry from any platform into one written with slashes. */
const withSlashes = (fileName: string) => fileName.replace(/\\/g, '/');

/** The event files that are not directly in the events folder, if any. */
export function eventFilesInSubFolders(fileNames: ReadonlyArray<string>): string[] {
  return fileNames
    .map(withSlashes)
    .filter((fileName) => fileName.endsWith('.md') && fileName.includes('/'));
}

/** The build-failure message for an event the site could never build a page for. */
export function eventInSubFolderMessage(fileName: string): string {
  const path = withSlashes(fileName);
  const folder = path.slice(0, path.lastIndexOf('/'));
  const name = path.slice(path.lastIndexOf('/') + 1);
  return (
    `The event saved as "${name}" is inside a folder called "${folder}", and the ` +
    'website cannot build a page for it there: every event has to sit in the ' +
    'Events list itself, not in a folder inside it. Take the file out of that ' +
    'folder, or send this message to the site maintainer and ask them to. ' +
    'Nothing you can do in the CMS creates a folder like this, so somebody put ' +
    'it there by hand.'
  );
}
