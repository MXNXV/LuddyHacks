import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getPriorityColor } from './ChartUtils';
import FeatureDetails from './FeatureDetails';

const FeatureTable = ({ filteredIdeas, selectedFeature, toggleFeature }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Feature Details</CardTitle>
        <CardDescription>
          {filteredIdeas.length} feature{filteredIdeas.length !== 1 ? 's' : ''} matching current filters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Title</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Category</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">Votes</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">ROI</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">Effort</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">Risk</th>
                <th scope="col" className="px-4 py-3 text-center font-medium">Score</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Priority</th>
                <th scope="col" className="px-4 py-3 text-center font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredIdeas.length > 0 ? filteredIdeas.map((idea) => (
                <React.Fragment key={idea.docId}>
                  <tr 
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => toggleFeature(idea.docId)}
                  >
                    <td className="px-4 py-3 font-medium">{idea.title}</td>
                    <td className="px-4 py-3">{idea.category || '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.votes ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.roi ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.effort ?? '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.risk ?? '-'}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      {idea.composite_score !== undefined && (
                        <span
                          className="px-2 py-1 rounded-md"
                          style={{
                            backgroundColor: idea.composite_score > 0.7 
                              ? 'rgba(16, 185, 129, 0.2)' // green
                              : idea.composite_score > 0.5 
                                ? 'rgba(245, 158, 11, 0.2)' // amber
                                : 'rgba(239, 68, 68, 0.2)', // red
                            color: idea.composite_score > 0.7 
                              ? '#10b981' // green
                              : idea.composite_score > 0.5 
                                ? '#f59e0b' // amber
                                : '#ef4444' // red
                          }}
                        >
                          {idea.composite_score.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {idea.priority ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getPriorityColor(idea.priority),
                            color: getPriorityColor(idea.priority),
                            backgroundColor: `${getPriorityColor(idea.priority)}20`,
                          }}
                        >
                          {idea.priority}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {selectedFeature === idea.docId ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </td>
                  </tr>
                  {selectedFeature === idea.docId && (
                    <tr className="bg-muted/20">
                      <td colSpan={9} className="py-6 px-8">
                        <FeatureDetails idea={idea} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-muted-foreground">
                    No features match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureTable;