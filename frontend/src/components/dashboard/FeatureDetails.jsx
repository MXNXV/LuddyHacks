import React from 'react';
import ReActAnalysis from './ReActAnalysis';
import MetricsChart from './MetricsChart';

const FeatureDetails = ({ idea }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">ReAct Analysis</h3>
        <ReActAnalysis idea={idea} />
      </div>
      
      {idea.description && (
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{idea.description}</p>
        </div>
      )}
      
      <div>
        <h3 className="font-semibold mb-2">Metrics Analysis</h3>
        <MetricsChart idea={idea} />
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
  );
};

export default FeatureDetails;