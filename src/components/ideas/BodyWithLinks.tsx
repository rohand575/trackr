import React from 'react';
import { splitBodyByLinks } from '../../utils/linkUtils';
import { LinkChip } from './LinkChip';

interface BodyWithLinksProps {
  text: string;
  className?: string;
}

export const BodyWithLinks: React.FC<BodyWithLinksProps> = ({ text, className }) => {
  const parts = splitBodyByLinks(text);

  if (parts.every((p) => p.type === 'text')) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className}>
      {parts.map((part, i) =>
        part.type === 'link' ? (
          <LinkChip key={i} url={part.content} />
        ) : (
          <React.Fragment key={i}>{part.content}</React.Fragment>
        )
      )}
    </p>
  );
};
