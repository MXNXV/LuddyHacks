import React, { useState, useEffect, useMemo } from 'react';
import { db } from "@/lib/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { LoaderCircle } from 'lucide-react';
import {
  FilterBar,
  ROIScatterChart,
  TopFeaturesChart,
  MetricsDistributionChart,
  CategoryAnalysisChart,
  FeatureTable
} from '@/components/dashboard';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";


const DashboardPage = () => {

  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('composite_score');
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(collection(db, "ideas_output"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ideasData = [];
      querySnapshot.forEach((doc) => {
        ideasData.push({ docId: doc.id, ...doc.data() });
      });
      setIdeas(ideasData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching ideas:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data", { description: err.message });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleFeature = (docId) => {
    setSelectedFeature(prev => (prev === docId ? null : docId));
  };


  const handleUpdateFeature = async (docId, field, value) => {
    if (!['roi', 'effort', 'risk'].includes(field)) {
        console.error("Attempted to update invalid field:", field);
        toast.error("Invalid field update attempted.");
        throw new Error("Invalid field update attempted."); 
    }

    const ideaRef = doc(db, "ideas_output", docId); 

    try {
        await updateDoc(ideaRef, {
            [field]: value 
        });
        console.log(`Successfully updated ${field} for ${docId} to ${value}`);

        let currentIdeaState = ideas.find(idea => idea.docId === docId);
        let updatedIdeaData;

        if (!currentIdeaState) {
            console.warn(`Could not find idea ${docId} in local state to recalculate score. Fetching...`);
            const docSnap = await getDoc(ideaRef); 
            if (!docSnap.exists()) throw new Error("Document not found after update.");
            currentIdeaState = { docId: docSnap.id, ...docSnap.data() };

            updatedIdeaData = { ...currentIdeaState };
            toast.info("Fetched latest data to recalculate score.");
        } else {
             updatedIdeaData = {
                ...currentIdeaState,
                [field]: value 
            };
        }


        const deptBoost = Number(updatedIdeaData.deptBoost) || 1;
        const deptEffortMod = Number(updatedIdeaData.deptEffortMod) || 1;


        const roi = Number(updatedIdeaData.roi) || 0;
        const alignment = Number(updatedIdeaData.alignment) || 0;
        const votes = Number(updatedIdeaData.votes) || 0;
        const effort = Number(updatedIdeaData.effort) || 1; 
        const risk = Number(updatedIdeaData.risk) || 1; 


        const denominator = (effort * risk * deptEffortMod);
        if (denominator === 0) {
            console.error(`Cannot calculate composite score for ${docId}: Denominator is zero (Effort: ${effort}, Risk: ${risk}, Mod: ${deptEffortMod}).`);
            toast.error("Cannot calculate score: Effort or Risk results in zero denominator.");
            await updateDoc(ideaRef, { composite_score: null }); 
            return; 
        }


        const newCompositeScore =
          (roi * 2 + alignment * deptBoost + (votes / 100)) / denominator;



        await updateDoc(ideaRef, {
          composite_score: newCompositeScore
        });
        console.log(`Successfully updated composite_score for ${docId} to ${newCompositeScore}`);



    } catch (err) {
        console.error(`Failed during update process for ${docId}:`, err);
        throw err;
    }
  };

  const filteredIdeas = useMemo(() => {
    let result = ideas;

    if (selectedCategory !== 'All') {
      result = result.filter(idea => idea.category === selectedCategory);
    }

    if (selectedPriority !== 'All') {
      result = result.filter(idea => idea.priority === selectedPriority);
    }

    const sortedResult = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'roi':
          return (b.roi || 0) - (a.roi || 0);
        case 'votes':
          return (b.votes || 0) - (a.votes || 0);
        case 'effort_asc':
          return (a.effort || 0) - (b.effort || 0); 
        case 'risk_asc':
          return (a.risk || 0) - (b.risk || 0);
        case 'composite_score':
        default:

          const scoreA = a.composite_score ?? -Infinity;
          const scoreB = b.composite_score ?? -Infinity;
          return scoreB - scoreA;
      }
    });

    return sortedResult;
  }, [ideas, selectedCategory, selectedPriority, sortBy]);

  const categories = useMemo(() =>
    ['All', ...new Set(ideas.map(idea => idea.category).filter(Boolean))],
    [ideas]
  );

  const priorities = useMemo(() =>
    ['All', ...new Set(ideas.map(idea => idea.priority).filter(Boolean))],
    [ideas]
  );


  if (isLoading) {
    // ... loading JSX ...
    return (
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading dashboard data...</span>
        </div>
      );
  }

  if (error) {
    // ... error JSX ...
    return (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto p-6 rounded-lg border border-destructive/20 bg-card shadow-sm">
            <h2 className="text-2xl font-semibold mb-2 text-destructive">Error Loading Dashboard</h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Ideas Dashboard</h1>

      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        priorities={priorities}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ROIScatterChart filteredIdeas={filteredIdeas} />
        <TopFeaturesChart
          filteredIdeas={filteredIdeas}
          sortBy={sortBy}
        />
        <MetricsDistributionChart filteredIdeas={filteredIdeas} />
        <CategoryAnalysisChart filteredIdeas={filteredIdeas} />
      </div>


      <FeatureTable
          filteredIdeas={filteredIdeas}
          selectedFeature={selectedFeature}
          toggleFeature={toggleFeature}
          handleUpdateFeature={handleUpdateFeature} 
        />

    </div>
  );
};

export default DashboardPage;