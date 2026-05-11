"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "What should I do today?",
  "Create a Google post idea for our primary city.",
  "Give me 5 local content ideas for our service area.",
  "Explain this week's wins in simple language.",
  "What should I check before spending more on ads?",
  "Write a review reply draft for a happy customer."
];

export function GrowthChat({
  companyName,
  primaryCity,
  industry
}: {
  companyName: string;
  primaryCity: string;
  industry: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        `Ask me what to do next for ${companyName}. I can help with reviews, Google Business posts, local SEO, ad waste, project-photo content, and weekly wins.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(content = input) {
    const trimmed = content.trim();

    if (!trimmed || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed }
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = (await response.json()) as { reply?: string; error?: string };

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "I could not answer that yet."
        }
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Something went wrong. Try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          Ask DreamGrowth
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Chat with your AI Growth Operator
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Ask for the next action, a local post idea, review reply, ad cleanup,
          or a simple explanation of what is happening this week for your{" "}
          {industry.toLowerCase()} business.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="flex h-[620px] flex-col p-0">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Avatar icon={Bot} />
                  ) : null}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6",
                      message.role === "assistant"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" ? <Avatar icon={UserRound} /> : null}
                </div>
              ))}
              {loading ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  DreamGrowth is thinking...
                </div>
              ) : null}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask what to do next..."
                  className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={() => void sendMessage()} disabled={loading}>
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              Quick Prompts
            </div>
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                onClick={() =>
                  void sendMessage(
                    prompt
                      .replace("our primary city", primaryCity)
                      .replace("our service area", primaryCity)
                  )
                }
              >
                {prompt
                  .replace("our primary city", primaryCity)
                  .replace("our service area", primaryCity)}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Avatar({
  icon: Icon
}: {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-card ring-1 ring-border">
      <Icon className="h-4 w-4 text-accent-foreground" />
    </div>
  );
}
