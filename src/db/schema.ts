export const CATEGORIES = [
  'Groceries',
  'Rent',
  'Mortgage',
  'Electricity',
  'Electricity network',
  'Garbage collection',
  'Internet',
  'Bensin',
  'House insurance',
  'Car insurance',
  'Eating out',
  'Kid',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PAYER_IDS = ['you', 'partner'] as const;

export type PayerId = (typeof PAYER_IDS)[number];
