import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About This Project</h1>
      <p className="text-lg text-muted-foreground">
        This application allows users to submit and vote on new feature ideas.
        Submitted ideas are processed to evaluate their potential impact and effort.
      </p>
    </div>
  );
};

export default AboutPage;