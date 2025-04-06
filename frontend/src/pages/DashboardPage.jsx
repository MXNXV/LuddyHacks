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
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredIdeas = useMemo(() => {
    let result = ideas;
  
    if (selectedCategory !== 'All') {
      result = result.filter(idea => idea.category === selectedCategory);
    }
  
    if (selectedPriority !== 'All') {
      result = result.filter(idea => idea.priority === selectedPriority);
    }
  
    result.sort((a, b) => {
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
          return (b.composite_score || 0) - (a.composite_score || 0);
      }
    });
  
    return result;
  }, [ideas, selectedCategory, selectedPriority, sortBy]);

  const categories = useMemo(() => 
    ['All', ...new Set(ideas.map(idea => idea.category).filter(Boolean))], 
    [ideas]
  );
  
  const priorities = useMemo(() => 
    ['All', ...new Set(ideas.map(idea => idea.priority).filter(Boolean))], 
    [ideas]
  );

  const toggleFeature = (docId) => {
    setSelectedFeature(selectedFeature === docId ? null : docId);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading dashboard data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto p-6 rounded-lg border border-destructive/20">
          <h2 className="text-2xl font-semibold mb-2 text-destructive">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
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

      {/* Feature Table */}
      <FeatureTable 
        filteredIdeas={filteredIdeas} 
        selectedFeature={selectedFeature}
        toggleFeature={toggleFeature}
      />
    </div>
  );
};

export default DashboardPage;