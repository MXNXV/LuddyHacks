import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomTooltip } from './ChartUtils';
import { getPriorityColor } from './ChartUtils';

const TopFeaturesChart = ({ filteredIdeas, sortBy }) => {
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

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow hover:shadow-muted/50">
      <CardHeader className="pb-2 ">
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
  );
};

export default TopFeaturesChart;