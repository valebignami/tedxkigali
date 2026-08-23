// Two filters, not one, and a talk has to pass both.
//
// The pills used to be a single choice: pressing a topic released the
// programme. That reads as a mistake as soon as the two rows are stacked, and
// the numbers say why — narrowing to TEDxKigali Women gave five talks, then one
// of its editions gave three, and then pressing "business" gave *four*. A count
// that goes up when you add a filter is the page telling you it threw your last
// answer away.
//
// So: the top row picks a scope — everything, one programme, or one edition of
// one programme — and the topic row narrows whatever that scope holds.
import { hasTag, matchesScope, type Scope } from '~/lib/talk-filter';

const filters = document.querySelector<HTMLElement>('#talk-filters');
const grid = document.querySelector<HTMLElement>('#talks-grid');
const empty = document.querySelector<HTMLElement>('#talks-empty');

const scope: Scope = { kind: 'all', value: 'all' };
let topic: string | null = null;

function apply(): void {
  if (!grid) return;

  let visible = 0;
  grid.querySelectorAll<HTMLElement>('[data-talk]').forEach((card) => {
    const matches = matchesScope(card.dataset, scope) && hasTag(card.dataset.tags, topic);
    card.hidden = !matches;
    if (matches) visible += 1;
  });

  if (empty) empty.hidden = visible > 0;
}

/**
 * Opens the row of editions belonging to one programme and closes the rest.
 *
 * Every row is in the page from the start and all of them begin hidden, so this
 * only ever changes an attribute. Pass null to close them all, which is what
 * "All" means: it is not inside a programme, and a row left open under it would
 * be offering to narrow a choice that is no longer being made.
 */
function openEditionsFor(programme: string | null): void {
  filters?.querySelectorAll<HTMLElement>('[data-editions-for]').forEach((row) => {
    row.hidden = row.dataset.editionsFor !== programme;
  });
  // Which button opened it. Without this the row appears attached to the whole
  // top row rather than to the one programme it belongs to — and picking an
  // edition releases that programme's pressed state, so nothing at all would
  // point back at it.
  filters?.querySelectorAll<HTMLElement>('[data-filter-kind="programme"]').forEach((button) => {
    button.setAttribute('aria-expanded', String(button.dataset.filterValue === programme));
  });
}

/** Presses exactly the buttons of `kinds` whose value is `value`, releasing the rest. */
function press(kinds: string[], value: string | null): void {
  filters?.querySelectorAll<HTMLElement>('[data-filter-value]').forEach((button) => {
    if (!kinds.includes(button.dataset.filterKind ?? '')) return;
    button.setAttribute('aria-pressed', String(button.dataset.filterValue === value));
  });
}

filters?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-filter-value]');
  if (!button) return;

  const kind = button.dataset.filterKind ?? 'edition';
  const value = button.dataset.filterValue ?? 'all';

  if (kind === 'tag') {
    // The topic row has no "none" button of its own, so pressing the one that
    // is already down is how a visitor takes it off again. The scope row does
    // have one — "All" — so nothing there toggles: two ways to do the same
    // thing is how a visitor ends up unsure which they used.
    topic = topic === value ? null : value;
    press(['tag'], topic);
  } else {
    scope.kind = kind === 'programme' ? 'programme' : kind === 'edition' ? 'edition' : 'all';
    scope.value = value;
    press(['all', 'programme', 'edition'], value);
    // An edition button sits inside the row that is already open, so its own
    // row stays where it is; a programme opens its row, and "All" closes them.
    if (kind === 'programme') openEditionsFor(value);
    else if (kind !== 'edition') openEditionsFor(null);
  }

  apply();
});
