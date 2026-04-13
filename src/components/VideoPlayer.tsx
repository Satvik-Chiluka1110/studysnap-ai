import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Chapter } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  images: string[];
  script: string;
  chapters?: Chapter[];
}

export default function VideoPlayer({ images, script, chapters = [] }: Props) {
  const [playing, setPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);
  const totalSlides = images.length || 1;
  const slideDuration = 8000;

  const activeChapter = chapters.length > 0
    ? [...chapters].reverse().find(ch => currentSlide >= ch.startSlide) || chapters[0]
    : null;

  const stop = useCallback(() => {
    setPlaying(false);
    speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const playFromSlide = useCallback((startSlideIndex: number, narrationText: string) => {
    if (images.length === 0) return;
    stop();

    setTimeout(() => {
      setPlaying(true);
      setCurrentSlide(startSlideIndex);
      const startElapsed = startSlideIndex * slideDuration;
      const totalDuration = totalSlides * slideDuration;
      setProgress((startElapsed / totalDuration) * 100);

      const utterance = new SpeechSynthesisUtterance(narrationText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => stop();
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);

      let elapsed = startElapsed;
      const tick = 200;

      intervalRef.current = window.setInterval(() => {
        elapsed += tick;
        const newSlide = Math.min(Math.floor(elapsed / slideDuration), totalSlides - 1);
        setCurrentSlide(newSlide);
        setProgress(Math.min((elapsed / totalDuration) * 100, 100));

        if (elapsed >= totalDuration) {
          stop();
        }
      }, tick);
    }, 100);
  }, [images, totalSlides, stop]);

  const play = useCallback(() => {
    playFromSlide(0, script);
  }, [playFromSlide, script]);

  const jumpToChapter = useCallback((chapter: Chapter) => {
    // Build narration from this chapter onward
    const chapterIndex = chapters.indexOf(chapter);
    const remainingNarration = chapters
      .slice(chapterIndex)
      .map(ch => ch.narrationSegment)
      .join(" ");
    playFromSlide(chapter.startSlide, remainingNarration || script);
    setShowChapters(false);
  }, [chapters, playFromSlide, script]);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const restart = () => {
    stop();
    setTimeout(play, 100);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentSlide] || images[0]}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No images available
          </div>
        )}

        {/* Chapter title overlay */}
        {activeChapter && playing && (
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur px-3 py-1.5 rounded-md text-xs font-semibold text-primary animate-fade-in">
            {activeChapter.title}
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-medium">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>

      {/* Progress bar with chapter markers */}
      <div className="relative">
        <Progress value={progress} className="h-1.5" />
        {chapters.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {chapters.map((ch, i) => {
              const position = (ch.startSlide / totalSlides) * 100;
              if (position === 0) return null;
              return (
                <div
                  key={i}
                  className="absolute top-0 w-0.5 h-full bg-primary/70"
                  style={{ left: `${position}%` }}
                  title={ch.title}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!playing ? (
          <Button onClick={play} className="gap-2 gradient-primary border-0">
            <Play className="h-4 w-4" /> Play
          </Button>
        ) : (
          <Button onClick={stop} variant="outline" className="gap-2">
            <Pause className="h-4 w-4" /> Pause
          </Button>
        )}
        <Button onClick={restart} variant="outline" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
        {chapters.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowChapters(!showChapters)}
          >
            <BookOpen className="h-4 w-4" /> Chapters
          </Button>
        )}
        <Button variant="outline" className="gap-2 ml-auto" onClick={() => {
          toast("Video download coming soon!");
        }}>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>

      {/* Chapter list */}
      {showChapters && chapters.length > 0 && (
        <div className="border rounded-lg divide-y bg-card animate-fade-in">
          {chapters.map((chapter, i) => {
            const isActive = activeChapter?.title === chapter.title;
            return (
              <button
                key={i}
                onClick={() => jumpToChapter(chapter)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                  isActive ? "bg-accent/30 border-l-2 border-l-primary" : ""
                }`}
              >
                <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
                    {chapter.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Slide {chapter.startSlide + 1}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
