import React from 'react';

interface Props {
  icon?: React.ReactNode;
  text: string;
  linkText?: string;
  onLink?: () => void;
}

const EmptyState = ({ icon, text, linkText, onLink }: Props) => (
  <div className="svc-empty">
    {icon && <div className="svc-empty-icon">{icon}</div>}
    <div className="svc-empty-text">{text}</div>
    {linkText && (
      <span className="svc-empty-link" onClick={onLink}>
        {linkText}
      </span>
    )}
  </div>
);

export default EmptyState;
