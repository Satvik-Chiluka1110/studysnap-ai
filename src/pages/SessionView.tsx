import { useParams, useNavigate } from "react-router-dom";
import { Copy, FileDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import FlashcardsPanel from "@/components/FlashcardsPanel";
import { getSession } from "@/lib/storage";
import { toast } from "sonner";

export default function SessionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession(id || "");

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-20 space-y-4">
          <h2 className="text-2xl font-bold">Session not found</h2>
          <Button onClick={() => navigate("/")} variant="outline">Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.title}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(session.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <Tabs defaultValue="video" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="points">Key Points</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>

          {/* Video Tab */}
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>AI Explainer Video</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer images={session.imageUrls} script={session.narrationScript} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Summary</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => copyText(session.summary)}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}>
                    <FileDown className="h-3.5 w-3.5" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  {session.summary.split("\n").map((p, i) => (
                    <p key={i} className="mb-3 leading-relaxed">{p}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Points Tab */}
          <TabsContent value="points">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Key Points</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => copyText(session.keyPoints.join("\n"))}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}>
                    <FileDown className="h-3.5 w-3.5" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {session.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed pt-0.5">{point}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards">
            <FlashcardsPanel flashcards={session.flashcards} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
