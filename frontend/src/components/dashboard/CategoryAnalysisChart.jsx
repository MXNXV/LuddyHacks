import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomTooltip } from './ChartUtils';

const CategoryAnalysisChart = ({ filteredIdeas }) => {
  const chartData = useMemo(() => {
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
      avgScore: data.numWithScore > 0 ? parseFloat((data.totalScore / data.numWithScore).toFixed(2)) : 0,
    }));
  }, [filteredIdeas]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow hover:shadow-muted/50">
      <CardHeader className="pb-2">
        <CardTitle>Category Analysis</CardTitle>
        <CardDescription>Feature count and average score by category</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
  );
};

export default CategoryAnalysisChart;