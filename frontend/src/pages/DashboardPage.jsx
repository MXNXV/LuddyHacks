import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Cell, ComposedChart, Line, ZAxis 
} from 'recharts';

import { db } from "@/lib/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoaderCircle } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

const DashboardPage = () => {
  // Setup state variables
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('composite_score');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const scatterData = useMemo(() => 
    filteredIdeas.map(idea => ({
      x: idea.effort,
      y: idea.roi,
      z: idea.votes, 
      priority: idea.priority,
      title: idea.title,
      composite_score: idea.composite_score,
      votes: idea.votes,
      effort: idea.effort,
      roi: idea.roi,
    })).filter(d => d.x !== undefined && d.y !== undefined), 
    [filteredIdeas]
  );

  const topFeaturesData = useMemo(() => 
    filteredIdeas.slice(0, 8).map(idea => ({
      name: idea.title.length > 15 ? idea.title.substring(0, 15) + '...' : idea.title,
      value: idea[sortBy.replace('_asc', '')] || 0,
      priority: idea.priority,
      title: idea.title,
      roi: idea.roi,
      effort: idea.effort,
      votes: idea.votes,
      composite_score: idea.composite_score,
    })), 
    [filteredIdeas, sortBy]
  );

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


  const featuresByCategoryData = useMemo(() => {
    const categoryMap = filteredIdeas.reduce((acc, idea) => {
      const category = idea.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, totalScore: 0, numWithScore: 0 };
      }
      acc[category].count += 1;
      if (idea.composite_score !== undefined) {
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
        className="text-popover-foreground p-3 rounded-md border shadow-md text-sm"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.75)', // dark gray w/ opacity
          backdropFilter: 'blur(2px)' // optional: adds a soft blur
        }}
        >
          <p className="font-semibold mb-1">{data.title || label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex justify-between">
              <span>{entry.name}:</span> 
              <span className="font-medium ml-2" style={{ color: entry.color }}>{entry.value}</span>
            </p>
          ))}
          {data.votes !== undefined && (
            <p className="flex justify-between">
              <span>Votes:</span> 
              <span className="font-medium ml-2">{data.votes}</span>
            </p>
          )}
          {data.composite_score !== undefined && (
            <p className="flex justify-between">
              <span>Score:</span> 
              <span className="font-medium ml-2">{data.composite_score?.toFixed(2)}</span>
            </p>
          )}
          {data.priority && (
            <p className="flex justify-between mt-1">
              <span>Priority:</span> 
              <span className="font-medium ml-2">{data.priority}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  const toggleFeature = (docId) => {
    setSelectedFeature(selectedFeature === docId ? null : docId);
    setActiveStep(0); // Reset step when toggling features
  };

  const renderMetricsChart = (idea) => {
    const metricsData = [
      { name: 'ROI', value: idea.roi || 0 },
      { name: 'Effort', value: idea.effort || 0 },
      { name: 'Risk', value: idea.risk || 0 },
      { name: 'Alignment', value: idea.alignment || 0 }
    ];

    return (
      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metricsData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="value" name="Score">
              {metricsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : index === 2 ? '#EF4444' : '#3B82F6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderReActAnalysis = (idea) => {
    const steps = [
      {
        thought: "Analyzing feature metrics...",
        analysis: `This ${idea.category || 'feature'} has received ${idea.votes || 0} votes, indicating ${
          (idea.votes || 0) > 80 ? 'very strong' : (idea.votes || 0) > 60 ? 'strong' : 'moderate'
        } user interest. The ROI score of ${idea.roi || 0}/10 suggests ${
          (idea.roi || 0) >= 8 ? 'exceptional' : (idea.roi || 0) >= 6 ? 'good' : 'moderate'
        } potential value.`
      },
      {
        thought: "Evaluating implementation complexity...",
        analysis: `Implementation effort is rated ${idea.effort || 0}/10 (${
          (idea.effort || 0) >= 7 ? 'high' : (idea.effort || 0) >= 4 ? 'moderate' : 'low'
        }) with risk level ${idea.risk || 0}/5 (${
          (idea.risk || 0) >= 4 ? 'significant' : (idea.risk || 0) >= 2 ? 'moderate' : 'low'
        }). ${idea.reasoning?.effort || 'Consider the implementation complexity carefully.'}`
      },
      {
        thought: "Assessing strategic alignment...",
        analysis: `Strategic alignment score: ${idea.alignment || 0}/5. ${idea.reasoning?.alignment || 'Evaluate how this aligns with organizational goals.'}`
      },
      {
        thought: "Calculating value metrics...",
        analysis: `Composite score: ${(idea.composite_score || 0).toFixed(2)}. This places the feature in ${
          (idea.composite_score || 0) >= 1 ? 'high' : (idea.composite_score || 0) >= 0.6 ? 'medium' : 'low'
        } priority category. ${idea.explanation || ''}`
      }
    ];
    return (
      <div className="mt-4 space-y-4">
        <TypeAnimation
          sequence={[
            steps[activeStep].thought,
            1000,
            steps[activeStep].analysis,
            2000,
          ]}
          wrapper="div"
          cursor={true}
          repeat={0}
          className="font-mono text-sm"
        />
      </div>
    );
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
      <h1 className="text-3xl font-bold mb-6">Feature Prioritization Dashboard</h1>
      <Card className="mb-8">
  {/* <CardHeader className="pb-3">
    <CardTitle className="text-xl">Filters & Sorting</CardTitle>
    <CardDescription>Filter by category or priority, and sort features by metrics</CardDescription>
  </CardHeader> */}
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
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
        <label className="text-sm font-medium">Priority</label>
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
        <label className="text-sm font-medium">Sort By</label>
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

{/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {/* ROI vs Effort Scatter Chart */}
  {/* <Card> */}
  <Card className="shadow-md hover:shadow-lg transition-shadow">
  <CardHeader className="pb-2">
    <CardTitle>ROI vs Effort</CardTitle>
    <CardDescription>Bubble size represents number of votes</CardDescription>
  </CardHeader>
  <CardContent className="h-[350px]">
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 0, right: 30, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Effort" 
          label={{ value: 'Effort', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="ROI" 
          label={{ value: 'ROI', angle: -90, position: 'insideLeft' }}
        />
        <ZAxis dataKey="z" range={[60, 800]} name="Votes" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Scatter 
          name="Features" 
          data={scatterData} 
          fill="#8884d8" 
          shape="circle"
        >
          {scatterData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getPriorityColor(entry.priority)} 
              fillOpacity={0.7}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


  {/* Top Features Bar Chart */}
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>Top Features</CardTitle>
      <CardDescription>Top 8 by {sortBy.replace('_asc', '').replace('_', ' ')}</CardDescription>
    </CardHeader>
    <CardContent className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topFeaturesData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            interval={0} 
            tick={{ fontSize: 12 }}

          />
          <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            name={sortBy.replace('_asc', '').replace('_', ' ')}
            barSize={24}
          >
            {topFeaturesData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getPriorityColor(entry.priority)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* Metrics Distribution Chart */}
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>Metrics Distribution</CardTitle>
      <CardDescription>Average value for key metrics</CardDescription>
    </CardHeader>
    <CardContent className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metricsDistributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            name="Average Value" 
            radius={[4, 4, 0, 0]}
            barSize={40}
          >
            {metricsDistributionData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={['#3b82f6', '#10b981', '#6366f1', '#f59e0b'][index % 4]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* Features by Category Chart */}
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>Category Analysis</CardTitle>
      <CardDescription>Feature count and average score by category</CardDescription>
    </CardHeader>
    <CardContent className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={featuresByCategoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#3b82f6"
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#f59e0b"
            label={{ value: 'Avg Score', angle: 90, position: 'insideRight' }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="count" 
            fill="#3b82f6"
            name="Feature Count" 
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="avgScore" 
            stroke="#f59e0b"
            name="Avg Score" 
            strokeWidth={3} 
            dot={{ r: 5, fill: "#f59e0b" }} 
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>


      </div>

        {/* Feature Table */}

        <Card>
        <CardHeader className="pb-2">
          <CardTitle>Feature Details</CardTitle>
          <CardDescription>
            {filteredIdeas.length} feature{filteredIdeas.length !== 1 ? 's' : ''} matching current filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm divide-y divide-border">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Title</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">Votes</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">ROI</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">Effort</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">Risk</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">Score</th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">Priority</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredIdeas.length > 0 ? filteredIdeas.map((idea) => (
                  <React.Fragment key={idea.docId}>
                    <tr 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleFeature(idea.docId)}
                    >
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
                                ? 'rgba(16, 185, 129, 0.2)' // green
                                : idea.composite_score > 0.5 
                                  ? 'rgba(245, 158, 11, 0.2)' // amber
                                  : 'rgba(239, 68, 68, 0.2)', // red
                              color: idea.composite_score > 0.7 
                                ? '#10b981' // green
                                : idea.composite_score > 0.5 
                                  ? '#f59e0b' // amber
                                  : '#ef4444' // red
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
                              backgroundColor: `${getPriorityColor(idea.priority)}20`,
                            }}
                          >
                            {idea.priority}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {selectedFeature === idea.docId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                    </tr>
                    {selectedFeature === idea.docId && (
                      <tr className="bg-muted/20">
                        <td colSpan={9} className="py-6 px-8">
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold mb-2">ReAct Analysis</h3>
                              {renderReActAnalysis(idea)}
                            </div>
                            
                            {idea.description && (
                              <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground">{idea.description}</p>
                              </div>
                            )}
                            
                            <div>
                              <h3 className="font-semibold mb-2">Metrics Analysis</h3>
                              {renderMetricsChart(idea)}
                            </div>
                            
                            {idea.reasoning && (
                              <div>
                                <h3 className="font-semibold mb-2">Detailed Reasoning</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {idea.reasoning.effort && (
                                    <div className="bg-muted/30 p-4 rounded-md">
                                      <h4 className="font-medium mb-1">Effort Assessment</h4>
                                      <p className="text-muted-foreground">{idea.reasoning.effort}</p>
                                    </div>
                                  )}
                                  {idea.reasoning.alignment && (
                                    <div className="bg-muted/30 p-4 rounded-md">
                                      <h4 className="font-medium mb-1">Alignment Analysis</h4>
                                      <p className="text-muted-foreground">{idea.reasoning.alignment}</p>
                                    </div>
                                  )}
                                  {idea.reasoning.roi && (
                                    <div className="bg-muted/30 p-4 rounded-md">
                                      <h4 className="font-medium mb-1">ROI Potential</h4>
                                      <p className="text-muted-foreground">{idea.reasoning.roi}</p>
                                    </div>
                                  )}
                                  {idea.reasoning.risk && (
                                    <div className="bg-muted/30 p-4 rounded-md">
                                      <h4 className="font-medium mb-1">Risk Assessment</h4>
                                      <p className="text-muted-foreground">{idea.reasoning.risk}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-muted-foreground">
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