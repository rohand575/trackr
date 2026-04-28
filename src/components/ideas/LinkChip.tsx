import React from 'react';
import { useLinkTitle } from '../../hooks/useLinkTitle';

interface LinkChipProps {
  url: string;
}

export const LinkChip: React.FC<LinkChipProps> = ({ url }) => {
  const title = useLinkTitle(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-blue-500 dark:text-blue-400 hover:underline break-all"
    >
      {title}
    </a>
  );
};
