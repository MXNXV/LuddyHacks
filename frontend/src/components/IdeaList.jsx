import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, LoaderCircle, LayoutGrid, List, ArrowUpCircle, ArrowDownCircle,Search } from 'lucide-react';
import { db } from "@/lib/firebaseConfig";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, increment, writeBatch } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import NewIdeaModal from "./NewIdeaModal";

const IdeaList = () => {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(collection(db, "ideas_input"), orderBy("votes", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ideasData = [];
      querySnapshot.forEach((doc) => {

        ideasData.push({ docId: doc.id, ...doc.data() });
      });
      setIdeas(ideasData);
      setIsLoading(false);
    }, (err) => { 
      console.error("Error fetching ideas from Firestore: ", err);
      setError("Failed to load ideas. Please try again later.");
      toast.error("Failed to load ideas", { description: err.message });
      setIsLoading(false);
    });

    return () => unsubscribe();

  }, []); 


  const handleVote = async (docId, voteType) => {
    const ideaRef = doc(db, "ideas_output", docId);
    const ideaRefRaw = doc(db, "ideas_input", docId);
    console.log(`${docId} ${voteType}d`);
    const voteIncrementValue = voteType === 'up' ? 1 : -1;

    try {
      const batch = writeBatch(db);
      
      batch.update(ideaRef, {
        votes: increment(voteIncrementValue)
      });
      
      batch.update(ideaRefRaw, {
        votes: increment(voteIncrementValue)
      });
      
      await batch.commit();

    } catch (err) {
      console.error(`Failed to ${voteType}vote idea ${docId}:`, err);
      toast.error(`Failed to ${voteType}vote`, { description: err.message });
    }
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (ideas.length === 0 && !isLoading) {
      return <p className="text-center text-muted-foreground py-10">No ideas found.</p>;
  }
  

return (
  <div>

    <div className="flex justify-between items-center mb-10 gap-4">
      <div className="flex-1"></div>

      <div className="flex items-center gap-2 flex-1 justify-center">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md"> 
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ideas..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <NewIdeaModal />
      </div>

      <div className="flex gap-2 flex-1 justify-end">
        <Button
          className={"hover:cursor-pointer"}
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('grid')}
          aria-label="Grid View"
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <Button
          className={"hover:cursor-pointer"}
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
          aria-label="List View"
        >
          <List className="h-5 w-5" />
        </Button>
      </div>
    </div>

    {filteredIdeas.length === 0 && searchTerm && !isLoading && (
      <p className="text-center text-muted-foreground py-10">No ideas match your search.</p>
    )}

    <div
      className={
        viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          : "flex flex-col items-center gap-4"
      }
    >

      {filteredIdeas.map((idea) => (
        <Card
          key={idea.docId}
          className={`flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 ${
            viewMode === 'list' ? 'w-full max-w-3xl' : ''
          }`}
        >

           <CardHeader>
            <CardTitle className="text-lg font-semibold">{idea.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-3 h-[3.75rem]">
              {idea.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-border">
             <div className="flex flex-wrap gap-2">
             <Badge variant="outline">{idea.category}</Badge>
               {idea.roi !== undefined && <Badge variant="secondary">ROI: {idea.roi}</Badge>}
               {idea.effort !== undefined && <Badge variant="secondary">Effort: {idea.effort}</Badge>}
             </div>
            <div className="flex items-center gap-1">
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-7 w-7 text-muted-foreground hover:text-primary hover:cursor-pointer"
                 onClick={() => handleVote(idea.docId, 'up')}
                 aria-label="Upvote"
               >
                 <ArrowUpCircle className="h-5 w-5" />
               </Button>
               <Badge variant="outline" className="min-w-[40px] text-center justify-center">
                 {idea.votes}
               </Badge>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-7 w-7 text-muted-foreground hover:text-destructive hover:cursor-pointer"
                 onClick={() => handleVote(idea.docId, 'down')}
                 aria-label="Downvote"
               >
                 <ArrowDownCircle className="h-5 w-5" />
               </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);
};

export default IdeaList;