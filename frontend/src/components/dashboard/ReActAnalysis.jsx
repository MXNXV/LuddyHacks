import React, { useState, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ReActAnalysis = ({ idea }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);

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
        (idea.composite_score || 0) >= 0.7 ? 'high' : (idea.composite_score || 0) >= 0.5 ? 'medium' : 'low'
      } priority category. ${idea.explanation || ''}`
    }
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {showAllSteps ? (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-md">
              <p className="text-muted-foreground mb-2">{step.thought}</p>
              <p>{step.analysis}</p>
            </div>
          ))}
          <Button variant="outline" onClick={() => setShowAllSteps(false)}>
            Show Animated Analysis
          </Button>
        </div>
      ) : (
        <>
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
            className="font-mono text-sm p-4 bg-muted/30 rounded-md min-h-24"
          />
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={activeStep === 0}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-muted-foreground text-sm">
              Step {activeStep + 1} of {steps.length}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={nextStep} 
                disabled={activeStep === steps.length - 1}
                size="sm"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAllSteps(true)}
                size="sm"
              >
                View All
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReActAnalysis;