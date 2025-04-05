import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare } from 'lucide-react';

// Placeholder data (replace with actual data from props)
const placeholderData = {
  transcript: `Speaker A: Okay team, let's kick off the weekly sync. Any updates on the Project Phoenix deployment?
Speaker B: Yes, I pushed the final changes to staging yesterday. All tests passed. We're on track for the Thursday release.
Speaker A: Excellent. Any blockers?
Speaker C: The documentation for the new API endpoint is still pending. I'll prioritize that today.
Speaker A: Good. Let's ensure that's done by EOD tomorrow. Anything else?
Speaker B: Just a reminder about the team lunch on Friday.
Speaker A: Right, thanks for the reminder. Okay, let's wrap up. Good work everyone.`,
  summary: [
    "Project Phoenix deployment is on track for Thursday release.",
    "Final changes pushed to staging, all tests passed.",
    "API documentation is pending, to be completed by EOD tomorrow.",
    "Team lunch reminder for Friday.",
  ],
  actionItems: [
    { id: 1, task: "Complete API documentation for Project Phoenix", owner: "Speaker C", deadline: "Tomorrow EOD", completed: false },
    { id: 2, task: "Monitor staging environment for Project Phoenix", owner: "Speaker B", deadline: "Thursday AM", completed: false },
    { id: 3, task: "Prepare release notes", owner: "Speaker A", deadline: "Wednesday EOD", completed: true },
  ],
  sentiment: [
    { speaker: "Speaker A", sentiment: "Neutral", confidence: 0.85 },
    { speaker: "Speaker B", sentiment: "Positive", confidence: 0.92 },
    { speaker: "Speaker C", sentiment: "Neutral", confidence: 0.78 },
  ],
};

const getSentimentBadgeVariant = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return 'success'; // Assuming you add custom variants in globals.css
    case 'negative': return 'destructive';
    case 'neutral':
    default: return 'secondary';
  }
};


const ResultsDisplay = ({ results = placeholderData }) => {
  if (!results) return null; // Or show an error/empty state

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Smart Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                {results.summary.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript">
           <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
             <CardHeader>
               <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Full Transcript</CardTitle>
             </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                  {results.transcript}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="actions">
           <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
             <CardHeader>
               <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                 <CheckSquare className="h-5 w-5" /> Action Items
               </CardTitle>
             </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.actionItems.map((item) => (
                  <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-md border ${item.completed ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex-1 mb-2 md:mb-0 md:mr-4">
                      <p className={`font-medium text-gray-800 dark:text-gray-200 ${item.completed ? 'line-through' : ''}`}>{item.task}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Owner: {item.owner} | Deadline: {item.deadline}
                      </p>
                    </div>
                    <Badge variant={item.completed ? 'success' : 'outline'}>
                      {item.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment">
           <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
             <CardHeader>
               <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Sentiment Analysis</CardTitle>
             </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.sentiment.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.speaker}</span>
                    <Badge variant={getSentimentBadgeVariant(item.sentiment)}>
                      {item.sentiment}
                      {item.confidence && <span className="ml-1.5 text-xs opacity-75">({(item.confidence * 100).toFixed(0)}%)</span>}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsDisplay;