import Link from 'next/link';
import { ReactNode } from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  color: string;
}

export default function QuickActionCard({ title, description, icon, link, color }: QuickActionCardProps) {
  return (
    <Link href={link} className={`quick-action-card ${color}`}>
      <div className="quick-action-icon">{icon}</div>
      <h3 className="quick-action-title">{title}</h3>
      <p className="quick-action-description">{description}</p>
    </Link>
  );
} 