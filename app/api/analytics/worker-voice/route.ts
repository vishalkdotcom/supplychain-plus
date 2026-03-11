import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { surveyAnalysis, surveyResponseAnalysis } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    // 1. Fetch recent aggregated survey analysis
    const latestAnalysis = await db
      .select()
      .from(surveyAnalysis)
      .orderBy(desc(surveyAnalysis.analyzedAt))
      .limit(1);

    // 2. Fetch the newly inserted ML-processed responses 
    // (If none exist yet, fallback to empty array)
    const recentResponses = await db
      .select({
        id: surveyResponseAnalysis.responseId,
        text: surveyResponseAnalysis.responseText,
        sentiment: surveyResponseAnalysis.sentiment,
        topics: surveyResponseAnalysis.topics,
      })
      .from(surveyResponseAnalysis)
      .orderBy(desc(surveyResponseAnalysis.analyzedAt))
      .limit(10);

    // 3. For the demo, we generate a stable 6-month historical trend 
    // to populate the Recharts line graph interactively.
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    const timeline = months.map((month, i) => {
      // Simulate improving sentiment over time
      const basePositive = 100 + (i * 15);
      const baseNegative = 80 - (i * 10);
      const baseNeutral = 60;
      return {
        month,
        positive: Math.round(basePositive + Math.random() * 20),
        negative: Math.max(10, Math.round(baseNegative - Math.random() * 15)),
        neutral: Math.round(baseNeutral + Math.random() * 10),
      };
    });

    // Extract all topics from recent responses to find "emerging" ones
    const topicCounts: Record<string, number> = {};
    recentResponses.forEach(r => {
      if (Array.isArray(r.topics)) {
        r.topics.forEach(t => {
          if (typeof t === 'string') {
            const clean = t.toLowerCase();
            topicCounts[clean] = (topicCounts[clean] || 0) + 1;
          }
        });
      }
    });

    // Make top 3 topics
    const emergingTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        trend: count > 1 ? "up" : "stable", // simple logic for demo
      }));

    // If completely empty (script hasn't run), add fallbacks
    if (emergingTopics.length === 0) {
      emergingTopics.push(
        { name: "wages", count: 4, trend: "up" },
        { name: "overtime", count: 3, trend: "up" },
        { name: "harassment", count: 2, trend: "up" }
      );
    }

    return NextResponse.json({
      summary: latestAnalysis[0] || {
        responseCount: 1200,
        riskScore: 65,
        aiInsight: "Sentiment is improving locally. Watch for 'overtime' mentions peaking before holidays.",
      },
      timeline,
      emergingTopics,
      recentResponses: recentResponses.length > 0 ? recentResponses : [
        { id: "1", text: "The new safety training was very helpful.", sentiment: "positive", topics: ["safety"] },
        { id: "2", text: "Supervisors are yelling at us to meet the quota.", sentiment: "negative", topics: ["harassment"] }
      ],
    });
  } catch (error) {
    console.error(`[GET /api/analytics/worker-voice] Error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch worker voice analytics" },
      { status: 500 }
    );
  }
}
