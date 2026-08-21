import type { IconKey } from './types';

export const RECURRING_TEMPLATES: {
  group: string;
  icon: IconKey;
  items: { name: string; interval: number; intervalMonths: number | null }[];
}[] = [
  {
    group: 'Utilities',
    icon: 'bill',
    items: [
      { name: 'Electricity', interval: 30, intervalMonths: 1 },
      { name: 'Gas', interval: 30, intervalMonths: 1 },
      { name: 'Water + Trash', interval: 30, intervalMonths: 1 },
      { name: 'Internet', interval: 30, intervalMonths: 1 },
      { name: 'Cable', interval: 30, intervalMonths: 1 },
    ],
  },
  {
    group: 'Housing',
    icon: 'landmark',
    items: [
      { name: 'Mortgage', interval: 30, intervalMonths: 1 },
      { name: 'Property Tax', interval: 180, intervalMonths: 6 },
      { name: 'Insurance', interval: 365, intervalMonths: 12 },
      { name: 'HOA', interval: 30, intervalMonths: 1 },
    ],
  },
  {
    group: 'Home maintenance',
    icon: 'tool',
    items: [
      { name: 'Lawn mow', interval: 14, intervalMonths: null },
      { name: 'Water softener salt', interval: 30, intervalMonths: 1 },
      { name: 'Pest control', interval: 90, intervalMonths: 3 },
      { name: 'AC filter', interval: 90, intervalMonths: 3 },
    ],
  },
  {
    group: 'Vehicle',
    icon: 'car',
    items: [
      { name: 'Oil change', interval: 180, intervalMonths: 6 },
      { name: 'Tire rotation', interval: 180, intervalMonths: 6 },
      { name: 'Registration renewal', interval: 365, intervalMonths: 12 },
    ],
  },
  {
    group: 'Health',
    icon: 'health',
    items: [
      { name: 'Dentist visit', interval: 180, intervalMonths: 6 },
      { name: 'Annual physical', interval: 365, intervalMonths: 12 },
      { name: 'Eye exam', interval: 365, intervalMonths: 12 },
    ],
  },
  {
    group: 'Subscriptions',
    icon: 'tv',
    items: [
      { name: 'Netflix', interval: 30, intervalMonths: 1 },
      { name: 'Prime', interval: 30, intervalMonths: 1 },
      { name: 'Hulu', interval: 30, intervalMonths: 1 },
      { name: 'HBO Max', interval: 30, intervalMonths: 1 },
      { name: 'Doordash', interval: 30, intervalMonths: 1 },
    ],
  },
];
