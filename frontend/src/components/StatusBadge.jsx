import { CheckCircle2, AlertCircle, Clock3, XCircle } from 'lucide-react';

export default function StatusBadge({ variant = 'unknown', label, onClick, title }) {
  const Icon =
    variant === 'clean' ? CheckCircle2 :
    variant === 'dirty' ? AlertCircle :
    variant === 'inactive' ? XCircle :
    Clock3;

  const cssVariant = variant === 'inactive' ? 'dirty' : variant;
  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`status-badge ${cssVariant}${onClick ? ' interactive' : ''}`}
      onClick={onClick}
      title={title}
    >
      <Icon size={13} strokeWidth={2.25} aria-hidden="true" />
      <span>{label}</span>
    </Tag>
  );
}
