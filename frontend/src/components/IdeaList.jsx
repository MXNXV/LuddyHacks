import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Import Button
import { toast } from "sonner";
import { AlertTriangle, LoaderCircle, LayoutGrid, List } from 'lucide-react'; // Import view icons

const IdeaList = () => {
    const [ideas, setIdeas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
    useEffect(() => {
        // ... existing fetchIdeas logic ...
        const fetchIdeas = async () => {
          setIsLoading(true);
          setError(null);
          try {
            const response = await fetch('http://localhost:8000/ideas'); // Fetch from backend
            if (!response.ok) {
              // Handle non-2xx responses
              const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setIdeas(data);
          } catch (err) {
            console.error("Failed to fetch ideas:", err);
            setError(err.message);
            toast.error("Failed to load ideas", {
              description: err.message,
            });
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchIdeas();
      }, []);

    if (isLoading) {
    return (
        <div className="flex justify-center items-center py-10">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Ideas...</span>
        </div>
    );
    }

    if (error) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error loading ideas</p>
        <p className="text-sm">{error}</p>
        </div>
    );
    }

    if (ideas.length === 0 && !isLoading) { // Ensure not loading before showing empty
        return <p className="text-center text-muted-foreground py-10">No ideas found.</p>;
    }
  

    return (
        <div>
          {/* View Toggle Buttons */}
          <div className="flex justify-end mb-4 gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List View"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
    
          {/* Conditional Container for Ideas */}
          <div
            className={
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" // Grid classes
                : "flex flex-col gap-4" 
            }
          >
            {ideas.map((idea) => (
              <Card
                key={idea.ID}
                className={`flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 ${
                  viewMode === 'list' ? 'w-full max-w-3xl' : '' 
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-primary">{idea.Title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-3 h-[3.75rem]">
                    {idea.Description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {/* Optional: Adjust content layout based on viewMode if needed */}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Badge variant="secondary">ROI: {idea['Estimated ROI']}</Badge>
                  <Badge variant="secondary">Effort: {idea['Estimated Effort']}</Badge>
                  <Badge variant="outline">Votes: {idea.Votes}</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      );
    };
    
    export default IdeaList;