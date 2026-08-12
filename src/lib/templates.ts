import type { IconKey } from './types';

export const RECURRING_TEMPLATES: {
  group: string;
  icon: IconKey;
  items: { name: string; interval: number }[];
}[] = [
  {
    group: 'House',
    icon: 'home',
    items: [
      { name: 'AC filter change', interval: 90 },
      { name: 'Gutter cleaning', interval: 365 },
      { name: 'Smoke detector batteries', interval: 365 },
      { name: 'Water heater flush', interval: 365 },
    ],
  },
  {
    group: 'Vehicle',
    icon: 'car',
    items: [
      { name: 'Oil change', interval: 180 },
      { name: 'Tire rotation', interval: 180 },
      { name: 'Registration renewal', interval: 365 },
    ],
  },
  {
    group: 'Health',
    icon: 'health',
    items: [
      { name: 'Dentist visit', interval: 180 },
      { name: 'Annual physical', interval: 365 },
      { name: 'Eye exam', interval: 365 },
    ],
  },
];

export const BILL_TEMPLATES: {
  group: string;
  icon: IconKey;
  items: { name: string; interval: number }[];
}[] = [
  {
    group: 'Bills',
    icon: 'bill',
    items: [
      { name: 'Property tax', interval: 180 },
      { name: 'Home insurance', interval: 365 },
    ],
  },
];
