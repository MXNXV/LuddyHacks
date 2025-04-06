import React, { useState } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getPriorityColor } from './ChartUtils';
import FeatureDetails from './FeatureDetails';
import { Input } from "@/components/ui/input"; 
import { toast } from "sonner";

const FeatureTable = ({ filteredIdeas, selectedFeature, toggleFeature, handleUpdateFeature }) => {
  const [editingCell, setEditingCell] = useState(null); 
  const [editValue, setEditValue] = useState('');
  
  const handleCellClick = (docId, field, currentValue) => {
    if (editingCell) return;
    setEditingCell({ docId, field });
    setEditValue(String(currentValue ?? '')); 
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const saveChanges = async () => {
    if (!editingCell || typeof handleUpdateFeature !== 'function') {
        if (editingCell) {
            setEditingCell(null);
            setEditValue('');
        }
        return;
    }


    const { docId, field } = editingCell;
    const numericValue = parseInt(editValue, 10);

    if (isNaN(numericValue)) {
      toast.error(`Invalid input for ${field}. Please enter a number.`);
      setEditingCell(null);
      setEditValue('');
      return;
    }

    if (['roi', 'effort', 'risk'].includes(field) && (numericValue < 0 || numericValue > 10)) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} must be between 0 and 10.`);
        return;
    }


    try {

      await handleUpdateFeature(docId, field, numericValue);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      setEditingCell(null); // Exit editing mode on success
      setEditValue('');
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}. ${error.message}`);
    }

  };

  const handleInputBlur = () => {
    saveChanges();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveChanges(); 
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };


  const renderEditableCell = (idea, field) => {
    const isEditing = editingCell?.docId === idea.docId && editingCell?.field === field;
    const currentValue = idea[field] ?? '-';

    return (
      <td
        className="px-4 py-3 text-center cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => !isEditing && handleCellClick(idea.docId, field, idea[field])}
      >
        {isEditing ? (
          <Input
            type="number"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
            className="h-8 text-center w-16 mx-auto p-1"
            min="0" 
            max="10"
          />
        ) : (
          currentValue
        )}
      </td>
    );
  };


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow hover:shadow-muted/50">
      <CardHeader className="pb-2">
        <CardTitle>Feature Details</CardTitle>
        <CardDescription>
          {filteredIdeas.length} feature{filteredIdeas.length !== 1 ? 's' : ''} matching current filters. Click ROI, Effort, or Risk to edit.
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
                    className={`hover:bg-muted/50 transition-colors ${selectedFeature === idea.docId ? 'bg-muted/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleFeature(idea.docId)}>{idea.title}</td>
                    <td className="px-4 py-3">{idea.category || '-'}</td>
                    <td className="px-4 py-3 text-center">{idea.votes ?? '-'}</td>
                    {renderEditableCell(idea, 'roi')}
                    {renderEditableCell(idea, 'effort')}
                    {renderEditableCell(idea, 'risk')}
                    <td className="px-4 py-3 text-center font-medium">
                      {idea.composite_score !== undefined && (
                        <span
                          className="px-2 py-1 rounded-md"
                          style={{ /* ... score styling ... */ }}
                        >
                          {idea.composite_score.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {idea.priority ? (
                        <Badge
                          variant="outline"
                          style={{ /* ... priority styling ... */ }}
                        >
                          {idea.priority}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center cursor-pointer" onClick={() => toggleFeature(idea.docId)}>
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