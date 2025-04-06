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
    setIsOpen(false); // Close the dialog on successful submission
    // Optionally: trigger a refresh of the idea list here
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default"> {/* Use default variant for primary color */}
          <PlusCircle className="mr-2 h-4 w-4" /> New Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]"> {/* Adjust width as needed */}
        <DialogHeader>
          <DialogTitle>Submit a New Idea</DialogTitle>
          <DialogDescription>
            Fill out the form below to add your innovation suggestion.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <NewIdeaForm onSubmitSuccess={handleFormSubmitSuccess} />
        </div>
         {/* Footer is handled within the Form component now */}
         {/* <DialogFooter>
           <DialogClose asChild>
             <Button type="button" variant="secondary">Cancel</Button>
           </DialogClose>
         </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default NewIdeaModal;