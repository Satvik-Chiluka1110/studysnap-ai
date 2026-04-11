import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { getSessions, deleteSession } from "@/lib/storage";

export default function History() {
  const [sessions, setSessions] = useState(getSessions());
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(getSessions());
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Session History</h1>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              {sessions.length === 0 ? "No sessions yet. Create your first one!" : "No matching sessions."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <Card key={s.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Link to={`/session/${s.id}`} className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {s.title}
                      </CardTitle>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {new Date(s.createdAt).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{s.summary?.slice(0, 200)}</p>
                  <div className="flex gap-2 mt-2">
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
        )}
      </div>
    </Layout>
  );
}
