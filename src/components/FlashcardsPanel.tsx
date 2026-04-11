import { useState } from "react";
import { Eye, EyeOff, GraduationCap, Copy, FileDown, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Flashcard } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  flashcards: Flashcard[];
}

export default function FlashcardsPanel({ flashcards }: Props) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const toggleReveal = (i: number) => {
    const next = new Set(revealed);
    next.has(i) ? next.delete(i) : next.add(i);
    setRevealed(next);
  };

  const handleCopy = () => {
    const text = flashcards.map((f, i) => `Q${i + 1}: ${f.question}\nA: ${f.answer}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const submitAnswer = () => {
    setAnswered(true);
    const correct = flashcards[quizIndex].answer.toLowerCase();
    // Simple similarity check
    if (userAnswer.toLowerCase().trim().length > 0 &&
        correct.includes(userAnswer.toLowerCase().trim().split(" ")[0])) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIndex + 1 >= flashcards.length) {
      setQuizDone(true);
    } else {
      setQuizIndex(quizIndex + 1);
      setUserAnswer("");
      setAnswered(false);
    }
  };

  const resetQuiz = () => {
    setQuizMode(false);
    setQuizIndex(0);
    setScore(0);
    setUserAnswer("");
    setAnswered(false);
    setQuizDone(false);
  };

  if (quizMode) {
    if (quizDone) {
      return (
        <div className="text-center space-y-6 py-12">
          <GraduationCap className="h-16 w-16 mx-auto text-primary" />
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <p className="text-4xl font-extrabold gradient-text">
            {score} / {flashcards.length}
          </p>
          <p className="text-muted-foreground">
            {score >= flashcards.length * 0.7 ? "Great job! 🎉" : "Keep studying! 💪"}
          </p>
          <Button onClick={resetQuiz} className="gradient-primary border-0">Back to Flashcards</Button>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {quizIndex + 1} of {flashcards.length}</span>
          <span>Score: {score}</span>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-lg font-medium">{flashcards[quizIndex].question}</p>
            {!answered ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                />
                <Button onClick={submitAnswer} disabled={!userAnswer.trim()}>Submit</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-accent">
                  <p className="text-sm font-medium text-accent-foreground">Correct answer:</p>
                  <p className="text-sm">{flashcards[quizIndex].answer}</p>
                </div>
                <Button onClick={nextQuestion} className="w-full gap-2">
                  {quizIndex + 1 >= flashcards.length ? "See Results" : "Next Question"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Button variant="ghost" onClick={resetQuiz}>Exit Quiz</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => setQuizMode(true)} className="gap-2 gradient-primary border-0">
          <GraduationCap className="h-4 w-4" /> Quiz Mode
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleCopy}>
          <Copy className="h-4 w-4" /> Copy All
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => {
          window.print();
        }}>
          <FileDown className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcards.map((f, i) => (
          <Card
            key={i}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => toggleReveal(i)}
          >
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm">Q{i + 1}: {f.question}</p>
                <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7">
                  {revealed.has(i) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
              {revealed.has(i) && (
                <div className="p-3 rounded-md bg-accent text-sm text-accent-foreground animate-fade-in">
                  {f.answer}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
