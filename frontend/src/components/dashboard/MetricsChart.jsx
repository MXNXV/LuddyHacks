import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CustomTooltip } from './ChartUtils';

const MetricsChart = ({ idea }) => {
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
          <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} content={<CustomTooltip />} />
          <Bar dataKey="value" name="Score">
            {metricsData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={
                  index === 0 ? '#10B981' : 
                  index === 1 ? '#F59E0B' : 
                  index === 2 ? '#EF4444' : 
                  '#3B82F6'                 
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;