import type { ComponentType } from 'react';
import {
  House,
  Receipt,
  Wrench,
  Calendar,
  TvMinimal,
  Wifi,
  Zap,
  Flame,
  Droplet,
  Car,
  HeartPulse,
  Dumbbell,
  CreditCard,
  Landmark,
  PawPrint,
  Baby,
  Users,
  Briefcase,
  GraduationCap,
  Laptop,
  Plane,
  ShoppingCart,
  Package,
  Shield,
  Star,
  type LucideProps,
} from 'lucide-react';
import type { IconKey } from '../lib/types';

const ICONS: Record<IconKey, ComponentType<LucideProps>> = {
  home: House,
  bill: Receipt,
  tool: Wrench,
  cal: Calendar,
  tv: TvMinimal,
  wifi: Wifi,
  zap: Zap,
  flame: Flame,
  droplet: Droplet,
  car: Car,
  health: HeartPulse,
  dumbbell: Dumbbell,
  card: CreditCard,
  landmark: Landmark,
  pet: PawPrint,
  baby: Baby,
  users: Users,
  briefcase: Briefcase,
  graduationCap: GraduationCap,
  tech: Laptop,
  plane: Plane,
  cart: ShoppingCart,
  package: Package,
  shield: Shield,
  star: Star,
};

export const ICON_KEYS = Object.keys(ICONS) as IconKey[];

export function Icon({ name, size = 18 }: { name: IconKey; size?: number }) {
  const Cmp = ICONS[name] ?? ICONS.star;
  return <Cmp size={size} strokeWidth={2} aria-hidden="true" />;
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
