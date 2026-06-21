"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OnboardingForm({
  onComplete,
}: {
  onComplete: (data: { name: string; role: string; goals: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", role: "", goals: "" });

  const steps = [
    {
      title: "What's your name?",
      field: "name" as const,
      placeholder: "John Doe",
    },
    {
      title: "What best describes you?",
      field: "role" as const,
      placeholder: "Developer, Founder, Designer...",
    },
    {
      title: "What will you build?",
      field: "goals" as const,
      placeholder: "A SaaS app, a blog, an internal tool...",
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  function next() {
    if (isLast) {
      onComplete(data);
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Welcome! Let&apos;s set up your account</CardTitle>
        <CardDescription>
          Step {step + 1} of {steps.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={current.field}>{current.title}</Label>
            <Input
              id={current.field}
              value={data[current.field]}
              onChange={(e) =>
                setData((d) => ({ ...d, [current.field]: e.target.value }))
              }
              placeholder={current.placeholder}
              onKeyDown={(e) => e.key === "Enter" && next()}
              autoFocus
            />
          </div>
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={back}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button size="sm" onClick={next} disabled={!data[current.field]}>
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
