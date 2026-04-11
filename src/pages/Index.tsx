import { Link } from "react-router-dom";
import { Plus, BookOpen, Brain, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { getSessions, deleteSession } from "@/lib/storage";
import { useState } from "react";
import { Trash2 } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Explainer Video", desc: "Auto-generated slideshow with narration" },
  { icon: BookOpen, title: "Smart Summary", desc: "Plain-language content breakdown" },
  { icon: Brain, title: "Key Points", desc: "8-10 essential takeaways" },
  { icon: Clock, title: "Flashcards & Quiz", desc: "10-12 Q&A pairs with quiz mode" },
];

export default function Index() {
  const [sessions, setSessions] = useState(getSessions());

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero */}
        <section className="text-center space-y-6 py-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Study smarter with <span className="gradient-text">AI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste your notes or upload a PDF. Get an AI-generated video, summary, key points, and flashcards — all in one click.
          </p>
          <Link to="/session/new">
            <Button size="lg" className="gap-2 text-lg px-8 gradient-primary border-0">
              <Plus className="h-5 w-5" />
              New Study Session
            </Button>
          </Link>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Past Sessions */}
        {sessions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Sessions</h2>
              <Link to="/history">
                <Button variant="ghost" size="sm">View all →</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.slice(0, 6).map((s) => (
                <Card key={s.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Link to={`/session/${s.id}`} className="flex-1">
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {s.title}
                        </CardTitle>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {s.summary?.slice(0, 120)}...
                    </p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                        {s.keyPoints?.length || 0} points
                      </span>
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                        {s.flashcards?.length || 0} cards
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
