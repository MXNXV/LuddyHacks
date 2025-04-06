import React from 'react';

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div 
        className="text-popover-foreground p-3 rounded-md border shadow-md text-sm"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.75)', 
          backdropFilter: 'blur(2px)' 
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

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return '#10b981'; // green
    case 'medium': return '#f59e0b'; // amber
    case 'low': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
};