import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Tabs } from '../components/Tabs';
import { DataProvider } from '../context/DataContext';

export function AppShell() {
  return (
    <DataProvider>
      <div className="wrap">
        <Header />
        <Hero />
        <Tabs />
        <Outlet />
      </div>
    </DataProvider>
  );
}
