'use client';

import {
  BatteryCharging,
  BookOpen,
  Boxes,
  Cable,
  Camera,
  Cpu,
  Home,
  Layers,
  Package,
  Pill,
  ShieldCheck,
  Shirt,
  Sparkles,
  Utensils,
  Wrench,
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  switch (name) {
    case 'cable':
      return <Cable className={className} aria-hidden="true" />;
    case 'cpu':
      return <Cpu className={className} aria-hidden="true" />;
    case 'utensils':
      return <Utensils className={className} aria-hidden="true" />;
    case 'wrench':
      return <Wrench className={className} aria-hidden="true" />;
    case 'pill':
      return <Pill className={className} aria-hidden="true" />;
    case 'home':
      return <Home className={className} aria-hidden="true" />;
    case 'battery':
      return <BatteryCharging className={className} aria-hidden="true" />;
    case 'camera':
      return <Camera className={className} aria-hidden="true" />;
    case 'shirt':
      return <Shirt className={className} aria-hidden="true" />;
    case 'book':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'layers':
      return <Layers className={className} aria-hidden="true" />;
    case 'package':
      return <Package className={className} aria-hidden="true" />;
    default:
      return <Boxes className={className} aria-hidden="true" />;
  }
}
