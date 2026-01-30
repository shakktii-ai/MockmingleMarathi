
import { Sparkles } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

const motivationalMessages = [
  "या आठवड्यात तुमची स्पष्टता सुधारली आहे.",
  "पुढील रँक गाठण्यासाठी आणखी एक मुलाखत!",
  "प्रत्येक सराव तुम्हाला सामर्थ्यवान बनवतो.",
  "प्रत्येक सत्रासह तुमचा आत्मविश्वास वाढत आहे.",
];

interface WelcomeHeroProps {
  userName: string;
}

export function WelcomeHero({ userName }: WelcomeHeroProps) {
  const [randomMessage, setRandomMessage] = useState<string | null>(null);

  useEffect(() => {
    const msg =
      motivationalMessages[
      Math.floor(Math.random() * motivationalMessages.length)
      ];
    setRandomMessage(msg);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow-card animate-fade-in">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lavender opacity-50" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <span className="text-sm font-medium text-gold">AI कोच सज्ज</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          स्वागत आहे, {userName}
        </h1>

        <p className="text-lg text-foreground font-medium mb-1">
          तुमचा प्रगतीचा आढावा (Growth Snapshot)
        </p>

        <p className="text-muted-foreground">
          {randomMessage ?? "प्रेरणा लोड होत आहे..."}
        </p>
      </div>
    </div>
  );
}

