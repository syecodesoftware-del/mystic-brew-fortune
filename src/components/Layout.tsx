import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <div className="h-[64px]"></div>
      <main>{children}</main>
    </>
  );
};

export default Layout;
