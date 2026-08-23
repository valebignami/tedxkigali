const filters = document.querySelector<HTMLElement>('#talk-filters');
const grid = document.querySelector<HTMLElement>('#talks-grid');
const empty = document.querySelector<HTMLElement>('#talks-empty');

function apply(kind: string, value: string): void {
  if (!grid) return;

  let visible = 0;
  grid.querySelectorAll<HTMLElement>('[data-talk]').forEach((card) => {
    const matches =
      value === 'all' ||
      (kind === 'programme' && card.dataset.programme === value) ||
      (kind === 'edition' && card.dataset.edition === value) ||
      (kind === 'tag' && (card.dataset.tags ?? '').split('|').includes(value));

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
 * "All" and any topic mean: neither is inside a programme, and a row left open
 * under them would be offering to narrow a choice that is no longer being made.
 */
function openEditionsFor(programme: string | null): void {
  filters?.querySelectorAll<HTMLElement>('[data-editions-for]').forEach((row) => {
    row.hidden = row.dataset.editionsFor !== programme;
  });
}

filters?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-filter-value]');
  if (!button) return;

  filters.querySelectorAll<HTMLElement>('[data-filter-value]').forEach((other) => {
    other.setAttribute('aria-pressed', String(other === button));
  });

  const kind = button.dataset.filterKind ?? 'edition';
  // An edition button is inside the row that is already open, so its own row
  // stays where it is; everything else either opens one or closes them all.
  if (kind === 'programme') openEditionsFor(button.dataset.filterValue ?? null);
  else if (kind !== 'edition') openEditionsFor(null);

  apply(kind, button.dataset.filterValue ?? 'all');
});
