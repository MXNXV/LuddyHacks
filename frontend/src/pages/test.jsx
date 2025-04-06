import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ComposedChart, Line
} from 'recharts';
import { db } from '@/lib/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";


const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'oklch(0.65 0.2 140)'; 
    case 'medium': return 'oklch(0.75 0.15 80)';
    case 'low': return 'oklch(0.7 0.18 25)';
    default: return 'oklch(0.7 0.03 255)'; 
  }
};


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground p-3 rounded-md border shadow-md text-sm">
        <p className="font-semibold mb-1">{data.title}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
        {data.votes !== undefined && <p>Votes: {data.votes}</p>}
        {data.composite_score !== undefined && <p>Score: {data.composite_score?.toFixed(2)}</p>}
        {data.priority && <p>Priority: {data.priority}</p>}
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
  const [sortBy, setSortBy] = useState('composite_score'); // Default sort

  // Fetch data from Firestore
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const q = query(collection(db, "ideas_output")); // Query the output collection

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
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
      <h1 className="text-3xl font-bold mb-6">Feature Prioritization Dashboard</h1>

      {/* Filters and Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map(pri => <SelectItem key={pri} value={pri}>{pri}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="composite_score">Sort by Score (Desc)</SelectItem>
            <SelectItem value="roi">Sort by ROI (Desc)</SelectItem>
            <SelectItem value="votes">Sort by Votes (Desc)</SelectItem>
            <SelectItem value="effort_asc">Sort by Effort (Asc)</SelectItem>
            <SelectItem value="risk_asc">Sort by Risk (Asc)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ROI vs Effort Scatter Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ROI vs Effort (Size by Votes)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Effort" unit="" />
                <YAxis type="number" dataKey="y" name="ROI" unit="" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Legend />
                <Scatter name="Features" data={scatterData} fill="#8884d8">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Features Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 8 Features by {sortBy.replace('_asc', '').replace('_', ' ')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeaturesData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis type="number" />
                 <YAxis dataKey="name" type="category" width={80} interval={0} />
                 <Tooltip content={<CustomTooltip />} />
                 <Bar dataKey="value" name={sortBy.replace('_asc', '').replace('_', ' ')} >
                   {topFeaturesData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                   ))}
                 </Bar>
               </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metrics Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Metrics Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsDistributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(var(--primary))" name="Average Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Features by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Avg Score by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={featuresByCategoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="oklch(var(--primary))" label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: 'oklch(var(--foreground))' }} />
                <YAxis yAxisId="right" orientation="right" stroke="oklch(var(--secondary))" label={{ value: 'Avg Score', angle: 90, position: 'insideRight', fill: 'oklch(var(--foreground))' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="oklch(var(--primary))" name="Feature Count" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="oklch(var(--secondary))" name="Avg Composite Score" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs text-foreground uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Title</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3 text-center">Votes</th>
                  <th scope="col" className="px-4 py-3 text-center">ROI</th>
                  <th scope="col" className="px-4 py-3 text-center">Effort</th>
                  <th scope="col" className="px-4 py-3 text-center">Risk</th>
                  <th scope="col" className="px-4 py-3 text-center">Score</th>
                  <th scope="col" className="px-4 py-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filteredIdeas.length > 0 ? filteredIdeas.map((idea, index) => (
                  <tr key={idea.docId} className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/50'} hover:bg-accent hover:text-accent-foreground`}>
                    <td className="px-4 py-3 font-medium text-foreground">{idea.title}</td>
                    <td className="px-4 py-3">{idea.category || '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.votes ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.roi ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.effort ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.risk ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.composite_score?.toFixed(2) ?? '-'}</td>
                    <td className="px-4 py-3">
                      {idea.priority ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getPriorityColor(idea.priority),
                            color: getPriorityColor(idea.priority),
                            backgroundColor: `${getPriorityColor(idea.priority)}1A` // Add alpha for background
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
                    <td colSpan="8" className="text-center py-6">No features match the current filters.</td>
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