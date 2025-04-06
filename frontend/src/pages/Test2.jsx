import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ComposedChart, Line
} from 'recharts';
import { db } from '@/lib/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoaderCircle, AlertTriangle, Filter, SortDesc } from 'lucide-react';
import { toast } from "sonner";
import { motion } from "framer-motion"; // If you have framer-motion installed

// Global color reference object
const CHART_COLORS = {
  chart1: '#6366f1', // Default fallback colors (indigo)
  chart2: '#3b82f6', // (blue)
  chart3: '#ec4899', // (pink)
  chart4: '#10b981', // (emerald)
  chart5: '#f59e0b', // (amber)
  primary: '#6366f1', // (indigo)
  secondary: '#e5e7eb', // (gray-200)
  background: '#ffffff',
  border: '#e5e7eb',
  muted: '#6b7280'
};

// Priority color function using our color object
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return CHART_COLORS.chart1;
    case 'medium': return CHART_COLORS.chart3;
    case 'low': return CHART_COLORS.chart5;
    default: return CHART_COLORS.muted;
  }
};

// Helper function to create a semi-transparent version of a color
const withOpacity = (color, opacity = 0.2) => {
  // If the color is a hex color, convert it to rgba
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Otherwise assume it's already a CSS color function and return with opacity
  return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
};

// Enhanced tooltip with better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground p-4 rounded-lg border shadow-lg text-sm max-w-xs">
        <p className="font-semibold mb-2 text-base">{data.title}</p>
        <div className="space-y-1 mt-2">
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex items-center justify-between">
              <span>{entry.name}:</span> 
              <span className="font-medium" style={{ color: entry.color }}>{entry.value}</span>
            </p>
          ))}
          {data.votes !== undefined && (
            <p className="flex items-center justify-between">
              <span>Votes:</span> 
              <span className="font-medium">{data.votes}</span>
            </p>
          )}
          {data.composite_score !== undefined && (
            <p className="flex items-center justify-between">
              <span>Score:</span> 
              <span className="font-medium">{data.composite_score?.toFixed(2)}</span>
            </p>
          )}
          {data.priority && (
            <p className="flex items-center justify-between mt-1">
              <span>Priority:</span> 
              <Badge 
                variant="outline" 
                style={{
                  backgroundColor: withOpacity(getPriorityColor(data.priority), 0.2),
                  borderColor: getPriorityColor(data.priority),
                  color: getPriorityColor(data.priority)
                }}
              >
                {data.priority}
              </Badge>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('composite_score');
  const colorInitialized = useRef(false);
  
  // Load and sync CSS variables to our color object
  useEffect(() => {
    if (colorInitialized.current) return;
    
    try {
      const computedStyle = getComputedStyle(document.documentElement);
      const extractColor = (varName) => {
        const value = computedStyle.getPropertyValue(varName).trim();
        // If it's an empty string, return undefined to keep fallback color
        return value || undefined;
      };
      
      // Extract actual colors from CSS variables
      const chart1 = extractColor('--chart-1');
      const chart2 = extractColor('--chart-2');
      const chart3 = extractColor('--chart-3');
      const chart4 = extractColor('--chart-4');
      const chart5 = extractColor('--chart-5');
      const primary = extractColor('--primary');
      const secondary = extractColor('--secondary');
      const background = extractColor('--background');
      const border = extractColor('--border');
      const muted = extractColor('--muted-foreground');
      
      // Update our color object with actual values if available
      if (chart1) CHART_COLORS.chart1 = chart1;
      if (chart2) CHART_COLORS.chart2 = chart2;
      if (chart3) CHART_COLORS.chart3 = chart3;
      if (chart4) CHART_COLORS.chart4 = chart4;
      if (chart5) CHART_COLORS.chart5 = chart5;
      if (primary) CHART_COLORS.primary = primary;
      if (secondary) CHART_COLORS.secondary = secondary;
      if (background) CHART_COLORS.background = background;
      if (border) CHART_COLORS.border = border;
      if (muted) CHART_COLORS.muted = muted;
      
      colorInitialized.current = true;
      
      // Force a re-render to apply the new colors
      setIsLoading(prevIsLoading => prevIsLoading);
    } catch (e) {
      console.error("Error syncing CSS colors:", e);
      // Continue with fallback colors
    }
  }, []);

  // Data fetching from Firestore
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
      console.error("Error fetching ideas from Firestore: ", err);
      setError("Failed to load dashboard data. Please try again later.");
      toast.error("Failed to load data", { description: err.message });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memoized filtering and sorting
  const filteredIdeas = useMemo(() => {
    let result = ideas;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(idea => idea.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== 'All') {
      result = result.filter(idea => idea.priority === selectedPriority);
    }

    // Sort
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

  // --- Data for Charts ---

  // Scatter Chart Data (ROI vs Effort)
  const scatterData = useMemo(() => filteredIdeas.map(idea => ({
    x: idea.effort,
    y: idea.roi,
    z: idea.votes, // Bubble size
    priority: idea.priority,
    title: idea.title,
    composite_score: idea.composite_score,
    votes: idea.votes,
    effort: idea.effort,
    roi: idea.roi,
  })).filter(d => d.x !== undefined && d.y !== undefined), [filteredIdeas]);

  // Top Features Bar Chart Data
  const topFeaturesData = useMemo(() => filteredIdeas.slice(0, 8).map(idea => ({
    name: idea.title.length > 15 ? idea.title.substring(0, 15) + '...' : idea.title, // Shorten name for axis
    value: idea[sortBy.replace('_asc', '')] || 0, // Use the sort key's value
    priority: idea.priority,
    title: idea.title, // Full title for tooltip
    roi: idea.roi,
    effort: idea.effort,
    votes: idea.votes,
    composite_score: idea.composite_score,
  })), [filteredIdeas, sortBy]);

  // Metrics Distribution Data
  const metricsDistributionData = useMemo(() => {
    if (filteredIdeas.length === 0) return [];
    const totals = filteredIdeas.reduce((acc, idea) => {
      acc.roi += idea.roi || 0;
      acc.effort += idea.effort || 0;
      acc.alignment += idea.alignment || 0;
      acc.risk += idea.risk || 0;
      acc.count += 1;
      return acc;
    }, { roi: 0, effort: 0, alignment: 0, risk: 0, count: 0 });

    return [
      { name: 'Avg ROI', value: totals.count > 0 ? (totals.roi / totals.count).toFixed(1) : 0 },
      { name: 'Avg Effort', value: totals.count > 0 ? (totals.effort / totals.count).toFixed(1) : 0 },
      { name: 'Avg Alignment', value: totals.count > 0 ? (totals.alignment / totals.count).toFixed(1) : 0 },
      { name: 'Avg Risk', value: totals.count > 0 ? (totals.risk / totals.count).toFixed(1) : 0 },
    ];
  }, [filteredIdeas]);

  // Features by Category Data
  const featuresByCategoryData = useMemo(() => {
    const categoryMap = filteredIdeas.reduce((acc, idea) => {
      const category = idea.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, totalScore: 0, numWithScore: 0 };
      }
      acc[category].count += 1;
      if (idea.composite_score !== undefined && idea.composite_score !== null) {
        acc[category].totalScore += idea.composite_score;
        acc[category].numWithScore += 1;
      }
      return acc;
    }, {});

    return Object.entries(categoryMap).map(([name, data]) => ({
      name,
      count: data.count,
      avgScore: data.numWithScore > 0 ? (data.totalScore / data.numWithScore).toFixed(2) : 0,
    }));
  }, [filteredIdeas]);


  // --- Get unique values for filters ---
  const categories = useMemo(() => ['All', ...new Set(ideas.map(idea => idea.category).filter(Boolean))], [ideas]);
  const priorities = useMemo(() => ['All', ...new Set(ideas.map(idea => idea.priority).filter(Boolean))], [ideas]);

  // --- Render Logic ---
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
        <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg border border-destructive/20">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
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
      {/* Header with subtle gradient background */}
      <div className="bg-gradient-to-r from-background to-card rounded-lg shadow-sm mb-8 p-6">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Feature Prioritization Dashboard</h1>
        <p className="text-muted-foreground max-w-3xl">
          Visualize and analyze feature ideas across different metrics to help prioritize development efforts.
        </p>
      </div>

      {/* Filters and Sorting with improved styling */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Filter className="mr-2 h-5 w-5" /> 
            Filters & Sorting
          </CardTitle>
          <CardDescription>
            Filter by category or priority, and sort features by different metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(pri => <SelectItem key={pri} value={pri}>{pri}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composite_score">Score (Highest First)</SelectItem>
                  <SelectItem value="roi">ROI (Highest First)</SelectItem>
                  <SelectItem value="votes">Votes (Highest First)</SelectItem>
                  <SelectItem value="effort_asc">Effort (Lowest First)</SelectItem>
                  <SelectItem value="risk_asc">Risk (Lowest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card style={{ backgroundColor: withOpacity(CHART_COLORS.primary, 0.05) }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Features</p>
              <p className="text-3xl font-bold">{filteredIdeas.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: withOpacity(CHART_COLORS.chart2, 0.05) }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
              <p className="text-3xl font-bold">
                {filteredIdeas.length > 0 
                  ? (filteredIdeas.reduce((sum, idea) => sum + (idea.composite_score || 0), 0) / filteredIdeas.length).toFixed(2) 
                  : "0.00"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: withOpacity(CHART_COLORS.chart3, 0.05) }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg ROI</p>
              <p className="text-3xl font-bold">
                {filteredIdeas.length > 0 
                  ? (filteredIdeas.reduce((sum, idea) => sum + (idea.roi || 0), 0) / filteredIdeas.length).toFixed(1) 
                  : "0.0"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card style={{ backgroundColor: withOpacity(CHART_COLORS.chart1, 0.05) }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Votes</p>
              <p className="text-3xl font-bold">
                {filteredIdeas.reduce((sum, idea) => sum + (idea.votes || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section with consistent styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ROI vs Effort Scatter Chart */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>ROI vs Effort</CardTitle>
            <CardDescription>Bubble size represents number of votes</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Effort" 
                  unit="" 
                  label={{ value: 'Effort', position: 'insideBottom', offset: -5 }}
                  stroke={CHART_COLORS.muted}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="ROI" 
                  unit="" 
                  label={{ value: 'ROI', angle: -90, position: 'insideLeft' }}
                  stroke={CHART_COLORS.muted}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Scatter 
                  name="Features" 
                  data={scatterData} 
                  fill={CHART_COLORS.primary}
                  shape="circle"
                >
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getPriorityColor(entry.priority)} 
                      fillOpacity={0.7}
                      // Adjust radius based on votes (min 6, max 20)
                      r={Math.max(6, Math.min(20, ((entry.votes || 0) / 10) + 6))}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Features Bar Chart with improved layout */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Top Features</CardTitle>
            <CardDescription>Top 8 by {sortBy.replace('_asc', '').replace('_', ' ')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeaturesData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis type="number" stroke={CHART_COLORS.muted} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  interval={0} 
                  tick={{ fontSize: 12 }}
                  stroke={CHART_COLORS.muted}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  name={sortBy.replace('_asc', '').replace('_', ' ')}
                  animationDuration={1500}
                  // Set a minimum bar width for better visual appeal
                  barSize={24}
                >
                  {topFeaturesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getPriorityColor(entry.priority)} 
                      // Create a subtle gradient effect
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metrics Distribution Chart */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Metrics Distribution</CardTitle>
            <CardDescription>Average value for key metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsDistributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.chart1} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.chart2} stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="name" stroke={CHART_COLORS.muted} />
                <YAxis stroke={CHART_COLORS.muted} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  name="Average Value" 
                  // Use different colors for each metric
                  fill="url(#colorGradient)"
                  // Rounded bar corners look more modern
                  radius={[4, 4, 0, 0]}
                  // Animate the bars on render
                  animationDuration={1500}
                  barSize={40}
                >
                  {metricsDistributionData.map((entry, index) => {
                    const colors = [
                      CHART_COLORS.chart1, 
                      CHART_COLORS.chart2, 
                      CHART_COLORS.chart3, 
                      CHART_COLORS.chart4
                    ];
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Features by Category Chart */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Category Analysis</CardTitle>
            <CardDescription>Feature count and average score by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={featuresByCategoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="name" stroke={CHART_COLORS.muted} />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke={CHART_COLORS.primary}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: CHART_COLORS.muted }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke={CHART_COLORS.chart3}
                  label={{ value: 'Avg Score', angle: 90, position: 'insideRight', fill: CHART_COLORS.muted }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Bar 
                  yAxisId="left" 
                  dataKey="count" 
                  fill={CHART_COLORS.primary}
                  name="Feature Count" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke={CHART_COLORS.chart3}
                  name="Avg Score" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: CHART_COLORS.chart3 }} 
                  activeDot={{ r: 7, fill: CHART_COLORS.chart3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Table with improved styling */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Details</CardTitle>
              <CardDescription>
                {filteredIdeas.length} feature{filteredIdeas.length !== 1 ? 's' : ''} matching current filters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm divide-y divide-border">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-foreground">Title</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-foreground">Category</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-foreground">Votes</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-foreground">ROI</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-foreground">Effort</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-foreground">Risk</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium text-foreground">Score</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium text-foreground">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredIdeas.length > 0 ? filteredIdeas.map((idea, index) => (
                  <tr key={idea.docId} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{idea.title}</td>
                    <td className="px-4 py-3">{idea.category || '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.votes ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.roi ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.effort ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.risk ?? '-'}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      {idea.composite_score !== undefined && (
                        <span
                          className="px-2 py-1 rounded-md"
                          style={{
                            backgroundColor: idea.composite_score > 0.7 
                              ? withOpacity(CHART_COLORS.chart1, 0.2)
                              : idea.composite_score > 0.5 
                                ? withOpacity(CHART_COLORS.chart3, 0.2)
                                : withOpacity(CHART_COLORS.chart5, 0.2),
                            color: idea.composite_score > 0.7 
                              ? CHART_COLORS.chart1
                              : idea.composite_score > 0.5 
                                ? CHART_COLORS.chart3
                                : CHART_COLORS.chart5
                          }}
                        >
                          {idea.composite_score.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {idea.priority ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getPriorityColor(idea.priority),
                            color: getPriorityColor(idea.priority),
                            backgroundColor: withOpacity(getPriorityColor(idea.priority), 0.1),
                          }}
                          className="font-medium"
                        >
                          {idea.priority}
                        </Badge>
                      ) : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted-foreground">
                      No features match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;