import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { db } from '@/lib/firebaseConfig'; 
import { collection, setDoc, serverTimestamp, doc } from "firebase/firestore"; 


const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description cannot exceed 500 characters."
  }),
});

const categories = ["UI/UX", "Security", "AI", "Other Feature", "Mobile"];

const NewIdeaForm = ({ onSubmitSuccess }) => {

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
    },
  });


  async function onSubmit(values) {
    console.log("Form Submitted:", values);
    form.control.disabled = true;
    try {
      const newIdeaRef = doc(collection(db, "ideas_input"));
      
      await setDoc(newIdeaRef, {
        id: newIdeaRef.id, 
        title: values.title,
        category: values.category,
        description: values.description,
        votes: 0,
        createdAt: serverTimestamp()
      });
      
      console.log("Document written to ideas_input with ID: ", newIdeaRef.id);

      toast.success("Idea Submitted!", {
        description: `Title: ${values.title}`,
      });

      form.reset();
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (e) {
      console.error("Error adding document: ", e);
      toast.error("Submission Failed", {
        description: "Could not submit your idea. Please try again.",
      });
    } finally {
      form.control.disabled = false;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a concise title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select 
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your idea in detail"
                  className="resize-none" 
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Explain the problem and your proposed solution.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit Idea"}
        </Button>
      </form>
    </Form>
  );
};

export default NewIdeaForm;