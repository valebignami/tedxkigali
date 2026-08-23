const filters = document.querySelector<HTMLElement>('#talk-filters');
const grid = document.querySelector<HTMLElement>('#talks-grid');
const empty = document.querySelector<HTMLElement>('#talks-empty');

function apply(kind: string, value: string): void {
  if (!grid) return;

  let visible = 0;
  grid.querySelectorAll<HTMLElement>('[data-talk]').forEach((card) => {
    const matches =
      value === 'all' ||
      (kind === 'edition' && card.dataset.edition === value) ||
      (kind === 'tag' && (card.dataset.tags ?? '').split('|').includes(value));

    card.hidden = !matches;
    if (matches) visible += 1;
  });

  if (empty) empty.hidden = visible > 0;
}

filters?.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-filter-value]');
  if (!button) return;

  filters.querySelectorAll<HTMLElement>('[data-filter-value]').forEach((other) => {
    other.setAttribute('aria-pressed', String(other === button));
  });

  apply(button.dataset.filterKind ?? 'edition', button.dataset.filterValue ?? 'all');
});
