// Same shape as TICKET_STATUSES in src/lib/events.ts: the Zod enum and the
// component both read the tiers from here, so renaming one cannot leave the
// other behind. The CMS select in .pages.yml is a fourth copy that YAML cannot
// avoid — keep it in step with this list by hand.
export const SPONSOR_TIERS = ['headline', 'gold', 'partner', 'community'] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export const SPONSOR_TIER_LABELS: Record<SponsorTier, string> = {
  headline: 'Headline partner',
  gold: 'Gold partners',
  partner: 'Partners',
  community: 'Community partners',
};
