import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Manav from "@/assets/manav.png";
import Aamir from "@/assets/aamir.png";
import Atharva from "@/assets/atharva.png";



const teamMembers = [
  {
    name: "Aamir Hullur",
    role: "The UX Whisperer",
    description:
      "Aamir brings ideas to life with clean design and intuitive user experiences. He led the front-end development of our React interface and created a dashboard that feels as smart as it looks. His knack for storytelling made our platform feel human-centered and impactful.",
    image: Aamir,
  },
  {
    name: "Manav Mandal",
    role: "The Hustler",
    description:
      "Manav brought energy, vision, and relentless testing to the table. He refined our logic, optimized our mock dataset, and pitched in wherever needed. Manav's insight into real-world business needs helped align our tool to what actual innovation teams look for.",
    image: Manav,
  },
  {
    name: "Atharva Gurav",
    role: "The Brain Behind the Logic",
    description:
      "Atharva is our lead developer and system architect. With a sharp mind for structured thinking, he designed the AI agent's reasoning framework using the ReAct methodology. His passion for building explainable AI made sure our dashboard not only delivers results but also tells a story with each decision.",
    image: Atharva,
  },
];


export default function AboutPage() {
  return (
    <div className="mt-10 p-6 max-w-5xl mx-auto bg-card text-card-foreground rounded-xl shadow-xl mb-10">
      <div className="flex justify-center ">
      <span className="text-4xl font-bold text-center mb-6 text-primary">About Us – The Creators of Service </span>
      <span className="text-4xl font-bold text-center mb-6 text-opposite">WOW</span>
      </div>
      <p className="text-center text-lg mb-10 text-muted-foreground">
        Meet the team behind <strong>Service WOW</strong> – an AI-powered assistant that revolutionizes how innovation ideas are prioritized!
        Built for the hackathon challenge: <em>"Idea Portal AI Agent with React Framework"</em>.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl border border-border bg-popover text-popover-foreground shadow-md"
          >
            <Card className="overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-64 object-cover border-b border-border"
              />
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold text-primary mb-1">{member.name}</h2>
                <h3 className="text-md text-muted-foreground mb-3">{member.role}</h3>
                <p className="text-sm text-foreground">{member.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 text-center ">
        <h2 className="text-2xl font-bold text-primary mb-2">Why We Built This</h2>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          Organizations often struggle to make sense of hundreds of ideas. Our AI agent evaluates them based on effort, ROI, and strategic value using <strong>ReAct-style reasoning</strong>. It's explainable, adjustable, and visual – just like it should be.
        </p>
      </div>
    </div>
  );
}