import type { IconKey } from './types';

export const RECURRING_TEMPLATES: {
  group: string;
  icon: IconKey;
  items: { name: string; interval: number; intervalMonths: number | null }[];
}[] = [
  {
    group: 'House',
    icon: 'home',
    items: [
      { name: 'AC filter change', interval: 90, intervalMonths: 3 },
      { name: 'Gutter cleaning', interval: 365, intervalMonths: 12 },
      { name: 'Smoke detector batteries', interval: 365, intervalMonths: 12 },
      { name: 'Water heater flush', interval: 365, intervalMonths: 12 },
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
    group: 'Bills',
    icon: 'bill',
    items: [
      { name: 'Property tax', interval: 180, intervalMonths: 6 },
      { name: 'Home insurance', interval: 365, intervalMonths: 12 },
    ],
  },
];
