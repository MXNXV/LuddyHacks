import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import NewIdeaForm from './NewIdeaForm';
import { PlusCircle } from 'lucide-react';

const NewIdeaModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSubmitSuccess = () => {
    setIsOpen(false); 

  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className={'hover:cursor-pointer'}> 
          <PlusCircle className="mr-2 h-4 w-4" /> New Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]"> 
        <DialogHeader>
          <DialogTitle>Submit a New Idea</DialogTitle>
          <DialogDescription>
            Fill out the form below to add your innovation suggestion.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <NewIdeaForm onSubmitSuccess={handleFormSubmitSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewIdeaModal;