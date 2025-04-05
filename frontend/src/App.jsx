import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner"
import IdeaList from './components/IdeaList'; // Import the new component

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


  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header acting as Navbar */}

    <header className="py-4 px-6 border-b border-border flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <h1 className="text-2xl font-bold text-foreground">Innovation Hub</h1>
      <div className="flex items-center gap-2"> {/* Wrap buttons */}
        <Button>Action</Button>
        <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
      <div className="flex justify-center py-4">
        <input type="text" placeholder="Search ideas..." className="border border-border rounded-lg p-2 w-full max-w-md" />
      </div> 



      {/* Main content area */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Remove placeholder content */}
        {/* <h2 className="text-3xl font-semibold mb-4">Welcome to the Homepage!</h2>
        <p className="text-muted-foreground">
          This is the main content area. You can add your components and features here.
        </p> */}

        {/* Render the IdeaList component */}
        <IdeaList />

      </main>

      <Toaster richColors theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
}

export default App;