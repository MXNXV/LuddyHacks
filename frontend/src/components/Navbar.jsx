import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom'; 

const Navbar = () => {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary hover:text-primary/90"> {/* Link for Home */}
          Idea Board
        </Link>
        <div className="flex items-center gap-4">
            
          <Link to="/about">
            <Button variant="ghost">About</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;