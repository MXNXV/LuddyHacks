import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomTooltip } from './ChartUtils';

const MetricsDistributionChart = ({ filteredIdeas }) => {
  const metricsData = useMemo(() => {
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
      { name: 'Avg ROI', value: totals.count > 0 ? parseFloat((totals.roi / totals.count).toFixed(1)) : 0 },
      { name: 'Avg Effort', value: totals.count > 0 ? parseFloat((totals.effort / totals.count).toFixed(1)) : 0 },
      { name: 'Avg Alignment', value: totals.count > 0 ? parseFloat((totals.alignment / totals.count).toFixed(1)) : 0 },
      { name: 'Avg Risk', value: totals.count > 0 ? parseFloat((totals.risk / totals.count).toFixed(1)) : 0 },
    ];
  }, [filteredIdeas]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow hover:shadow-muted/50">
      <CardHeader className="pb-2">
        <CardTitle>Metrics Distribution</CardTitle>
        <CardDescription>Average value for key metrics</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
              {metricsData.map((entry, index) => (
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
  );
};

export default MetricsDistributionChart;