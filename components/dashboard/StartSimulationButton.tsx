import { Play, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link'
import React from 'react'
export function StartSimulationButton() {
  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <Link href="/role">  <Button variant="gradient" size="xl" className="group">
        <Play className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
        तुमचे सिम्युलेशन सुरू करा
      </Button></Link>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Bot className="h-4 w-4 text-teal" />
        <span className="text-sm">तुम्ही तयार असता तेव्हा AI कोच तयार असतो.</span>
      </div>
    </div>
  );
}
