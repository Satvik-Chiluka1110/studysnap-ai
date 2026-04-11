import { supabase } from "@/integrations/supabase/client";
import { GenerationResult } from "./types";

export async function generateStudyContent(
  content: string,
  onProgress: (step: string, pct: number) => void
): Promise<GenerationResult> {
  onProgress("Analyzing content...", 10);

  const { data, error } = await supabase.functions.invoke("generate-study", {
    body: { content },
  });

  if (error) {
    throw new Error(error.message || "Failed to generate study content");
  }

  onProgress("Processing results...", 80);

  const result = data as GenerationResult;

  onProgress("Complete!", 100);

  return result;
}
