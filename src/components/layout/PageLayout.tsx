import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export const PageLayout = ({ children, fullWidth = false }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={fullWidth ? "flex-1" : "flex-1 container mx-auto px-4 py-6"}>
        {children}
      </main>
    </div>
  );
};
