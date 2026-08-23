// Where the editing screen lives. Kept in one place because it is written in
// three: the /admin signpost redirects to it, docs/EDITING.md tells volunteers
// to use it, and a test holds those two to each other.
//
// The path segments are the GitHub owner, the repository and the branch, in
// that order — Pages CMS addresses a project by the repository it edits, so
// renaming or transferring the repository changes this url.
export const CMS_OWNER = 'valebignami';
export const CMS_REPO = 'tedxkigali';
export const CMS_BRANCH = 'main';

/** The editing screen, opened on the Events list — the commonest task. */
export const CMS_URL =
  `https://app.pagescms.org/${CMS_OWNER}/${CMS_REPO}/${CMS_BRANCH}/collection/events`;
