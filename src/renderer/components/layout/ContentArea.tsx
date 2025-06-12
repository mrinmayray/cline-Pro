import React, { ReactNode } from 'react';

interface ContentAreaProps {
  children: ReactNode;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ children }) => {
  return (
    <div className="flex-1 h-full overflow-hidden">
      {children}
    </div>
  );
};