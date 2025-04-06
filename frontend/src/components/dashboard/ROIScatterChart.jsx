import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomTooltip } from './ChartUtils';
import {
    ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, Legend, Cell, ComposedChart, Line, ZAxis 
  } from 'recharts';

const ROIScatterChart = ({ filteredIdeas }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#10b981'; 
      case 'medium': return '#f59e0b'; 
      case 'low': return '#ef4444'; 
      default: return '#6b7280'; 
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

  return (

    <Card className="shadow-md hover:shadow-lg transition-shadow hover:shadow-muted/50">
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
            <Tooltip cursor={{ strokeDasharray: '3 3'}} content={<CustomTooltip />} />
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
                //   r={Math.max(6, Math.min(20, ((entry.votes || 0) / 10) + 6))}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ROIScatterChart;