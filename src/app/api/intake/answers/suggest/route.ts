import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question_id, current_draft, prior_answers } = body;

  // AI suggestion endpoint — in production this calls DeepSeek/Anthropic.
  // For now return a contextual placeholder suggestion.
  const suggestions: Record<string, string> = {
    q1: "Try framing it as: [Brand Name] — [what you do] for [who you serve].",
    q2: "Pick the category where your highest-value clients search for solutions.",
    q3: "Describe one real person. Their role, their budget, their frustration.",
    q4: "Think of brands your audience already trusts — you'll differentiate from them.",
    q5: "Pick words that describe how you want clients to FEEL, not what you do.",
    q6: "Lead with your flagship. What generates the most revenue or attention?",
    q7: "Use their words, not yours. How would they describe this problem to a friend?",
    q8: "Be specific — revenue targets, client counts, recognition milestones.",
    q9: "If you have existing brand colors, include the hex codes. Otherwise skip.",
  };

  return Response.json({
    suggestion: suggestions[question_id] || "Try being more specific about what makes this unique.",
  });
}
