import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const truncated = content.slice(0, 16000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert study assistant and content creator. Your job is to deeply analyze the provided study content and generate highly specific, accurate study materials that are directly grounded in the source material.

CRITICAL RULES:
- Every piece of output MUST be directly derived from the provided content. Do NOT add general knowledge or filler.
- Use exact terminology, names, dates, formulas, and concepts from the source.
- The narration script must walk through the actual content like a detailed lecture — referencing specific facts, examples, and details from the text.
- Flashcards must test specific facts and concepts found in the content, not generic questions.
- Key points must be concrete statements with specific details from the content.
- Image keywords must relate to the specific topics discussed in the content.

You MUST respond with valid JSON using the exact schema provided via tool calling.`,
          },
          {
            role: "user",
            content: `Carefully analyze this study content and generate highly specific, content-faithful study materials. Every output must directly reference facts, concepts, and details from this text:\n\n${truncated}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_study_materials",
              description: "Generate comprehensive study materials that are highly specific to the provided content",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "A specific, descriptive title reflecting the exact topic of the content (max 60 chars)",
                  },
                  summary: {
                    type: "string",
                    description: "A detailed, plain-language summary in 4-6 paragraphs that covers ALL major points from the content. Include specific names, dates, numbers, and concepts mentioned in the source. Do not generalize.",
                  },
                  keyPoints: {
                    type: "array",
                    items: { type: "string" },
                    description: "10-12 key points as specific, factual statements directly from the content. Each point should include concrete details (names, numbers, dates, formulas, examples) found in the source material.",
                  },
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                      },
                      required: ["question", "answer"],
                      additionalProperties: false,
                    },
                    description: "12-15 Q&A flashcard pairs testing specific facts, definitions, relationships, and concepts from the content. Questions should be precise and answers should include exact details from the source.",
                  },
                  narrationScript: {
                    type: "string",
                    description: "A detailed 3-4 minute narration script that teaches the content like an engaging lecture. Walk through the material systematically, referencing specific facts, examples, and details from the text. Use transitions like 'Now let's look at...', 'An important detail here is...', 'The key takeaway is...'. Include pauses marked with '...' for emphasis. Do NOT use generic filler — every sentence must convey specific information from the source.",
                  },
                  chapters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short chapter title (e.g., 'Introduction', 'Key Concepts', 'Examples & Applications')" },
                        startSlide: { type: "number", description: "The 0-based slide/image index where this chapter begins" },
                        narrationSegment: { type: "string", description: "The portion of the narration script that belongs to this chapter" },
                      },
                      required: ["title", "startSlide", "narrationSegment"],
                      additionalProperties: false,
                    },
                    description: "4-6 chapters that divide the narration into logical sections. Each chapter maps to a slide range and a segment of the narration. The chapters should cover the full narration script sequentially.",
                  },
                  imageKeywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "8-10 specific, visual search keywords directly related to the topics, concepts, and subjects discussed in the content. Be precise (e.g., 'mitochondria cell organelle' not just 'biology', 'Renaissance painting Florence' not just 'art')",
                  },
                },
                required: ["title", "summary", "keyPoints", "flashcards", "narrationScript", "chapters", "imageKeywords"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_study_materials" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("AI did not return structured output");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-study error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
