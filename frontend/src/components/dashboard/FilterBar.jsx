import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FilterBar = ({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedPriority, 
  setSelectedPriority, 
  sortBy,
  setSortBy,
  categories,
  priorities 
}) => {
  return (

    <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow hover:shadow-muted/20">
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(pri => <SelectItem key={pri} value={pri}>{pri}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="composite_score">Score (Highest First)</SelectItem>
                <SelectItem value="roi">ROI (Highest First)</SelectItem>
                <SelectItem value="votes">Votes (Highest First)</SelectItem>
                <SelectItem value="effort_asc">Effort (Lowest First)</SelectItem>
                <SelectItem value="risk_asc">Risk (Lowest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;