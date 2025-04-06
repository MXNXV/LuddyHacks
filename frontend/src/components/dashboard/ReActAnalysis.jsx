import React from 'react';
import { TypeAnimation } from 'react-type-animation';

const ReActAnalysis = ({ idea }) => {

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


  const animationSequence = steps.flatMap(step => [
    step.thought,
    1000, 
    step.analysis,
    1000 
  ]);

  return (
    <div className="mt-4 space-y-4">
      <TypeAnimation
        sequence={animationSequence} 
        wrapper="div"
        cursor={true}
        repeat={0} 
        className="font-mono text-sm" 
      />
    </div>
  );
};

export default ReActAnalysis;