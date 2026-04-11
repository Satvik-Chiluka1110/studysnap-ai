import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Props {
  images: string[];
  script: string;
}

export default function VideoPlayer({ images, script }: Props) {
  const [playing, setPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);
  const totalSlides = images.length || 1;
  const slideDuration = 8000;

  const stop = useCallback(() => {
    setPlaying(false);
    speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const play = useCallback(() => {
    if (images.length === 0) return;
    setPlaying(true);
    setCurrentSlide(0);
    setProgress(0);

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => stop();
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);

    let slide = 0;
    let elapsed = 0;
    const tick = 200;
    const totalDuration = totalSlides * slideDuration;

    intervalRef.current = window.setInterval(() => {
      elapsed += tick;
      const newSlide = Math.min(Math.floor(elapsed / slideDuration), totalSlides - 1);
      setCurrentSlide(newSlide);
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));

      if (elapsed >= totalDuration) {
        stop();
      }
    }, tick);
  }, [images, script, totalSlides, stop]);

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
        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs font-medium">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>

      <Progress value={progress} className="h-1.5" />

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
        <Button variant="outline" className="gap-2 ml-auto" onClick={() => {
          toast("Video download coming soon!");
        }}>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
