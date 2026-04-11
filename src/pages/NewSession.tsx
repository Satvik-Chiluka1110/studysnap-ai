import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { generateStudyContent } from "@/lib/generate";
import { fetchUnsplashImages } from "@/lib/unsplash";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { saveSession } from "@/lib/storage";
import { SessionData } from "@/lib/types";
import { toast } from "sonner";

export default function NewSession() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20MB)");
      return;
    }

    setFileName(file.name);
    toast.info("Extracting text from PDF...");

    try {
      const text = await extractTextFromPdf(file);
      if (text.trim().length === 0) {
        toast.error("Could not extract text from this PDF");
        return;
      }
      setContent(text);
      toast.success(`Extracted text from ${file.name}`);
    } catch {
      toast.error("Failed to parse PDF. Try pasting text instead.");
    }
  };

  const handleGenerate = async () => {
    if (content.trim().length < 50) {
      toast.error("Please provide at least 50 characters of study content");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const result = await generateStudyContent(content, (s, p) => {
        setStep(s);
        setProgress(p);
      });

      setStep("Fetching images...");
      setProgress(90);
      const imageUrls = await fetchUnsplashImages(result.imageKeywords);

      const session: SessionData = {
        id: crypto.randomUUID(),
        title: result.title,
        createdAt: new Date().toISOString(),
        rawContent: content,
        summary: result.summary,
        keyPoints: result.keyPoints,
        flashcards: result.flashcards,
        narrationScript: result.narrationScript,
        imageKeywords: result.imageKeywords,
        imageUrls,
      };

      saveSession(session);
      toast.success("Study materials generated!");
      navigate(`/session/${session.id}`);
    } catch (err: any) {
      toast.error(err.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
      setStep("");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">New Study Session</h1>
          <p className="text-muted-foreground">
            Paste your study content or upload a PDF to generate AI-powered study materials.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Study Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your notes, textbook excerpt, or any study material here..."
              className="min-h-[250px] resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFile}
                />
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground">{fileName}</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {content.length.toLocaleString()} characters
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {loading && (
          <Card className="border-primary/30 bg-accent/30">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {step}
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || content.trim().length < 50}
          size="lg"
          className="w-full gap-2 gradient-primary border-0 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Study Materials
            </>
          )}
        </Button>
      </div>
    </Layout>
  );
}
