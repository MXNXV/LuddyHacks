import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LayoutDashboard } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner"
import IdeaList from './components/IdeaList'; 
import NewIdeaModal from './components/NewIdeaModal'; 
import AboutPage from './pages/AboutPage';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';

function App() {

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const MainPage = () => (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <IdeaList />
    </main>
  );

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>

      <header className="py-4 px-6 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Link to="/" className='flex items-baseline gap-1'>
          <span className='text-2xl font-bold text-foreground'>Service</span>
          <span className='text-2xl font-bold text-opposite'>WOW</span>
        </Link>
        <div className="flex items-center gap-2">
        <Link to="/dashboard">
            <Button variant="ghost" size="icon" className={"hover:cursor-pointer"} aria-label="Dashboard">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className={"hover:cursor-pointer"}>About</Button>
          </Link>
          <NewIdeaModal /> 
          <Button variant="ghost" size="icon" className={"hover:cursor-pointer"} onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>


      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>

      <Toaster richColors theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
}

export default App;