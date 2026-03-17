"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { IconWand, IconCopy, IconLoader2, IconBook, IconHistory, IconTrendingUp, IconSchool } from "@tabler/icons-react";
import { toast } from "sonner";
import { Case } from "@/types";

interface ActionPanelProps {
  caseData: Case;
  draftResponseText: string;
  setDraftResponseText: (text: string) => void;
  draftLanguage: string;
  setDraftLanguage: (lang: string) => void;
  draftTone: string;
  setDraftTone: (tone: string) => void;
  isRegeneratingDraft: boolean;
  onRegenerateDraft: () => void;
  copied: boolean;
  onCopy: () => void;
  playbookData?: {
    caseTypeName: string | null;
    avgResolutionDays: number | null;
    bestResolutionDays: number | null;
    totalResolved: number;
    bestPractices: string[];
    aiSummary: string;
  } | null;
  isPlaybookLoading: boolean;
  caseTopic: string;
}

export function ActionPanel({
  caseData,
  draftResponseText,
  setDraftResponseText,
  draftLanguage,
  setDraftLanguage,
  draftTone,
  setDraftTone,
  isRegeneratingDraft,
  onRegenerateDraft,
  copied,
  onCopy,
  playbookData,
  isPlaybookLoading,
  caseTopic,
}: ActionPanelProps) {
  const suggestedFAQs = caseData.aiGuidance?.suggestedFAQs || [];
  const relatedTraining = caseData.aiGuidance?.relatedTraining || [];
  const hasPlaybook = playbookData && playbookData.totalResolved > 0;
  const hasKnowledgeBase = suggestedFAQs.length > 0 || hasPlaybook;

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      {/* Draft Response — promoted to top */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Draft Response</CardTitle>
              <CardDescription className="text-xs">
                Suggested reply to the worker
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Select value={draftLanguage} onValueChange={setDraftLanguage}>
              <SelectTrigger className="h-7 w-[110px] text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Bengali">Bengali</SelectItem>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
            <Select value={draftTone} onValueChange={setDraftTone}>
              <SelectTrigger className="h-7 w-[110px] text-xs">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Empathetic">Empathetic</SelectItem>
                <SelectItem value="Firm">Firm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={draftResponseText}
            onChange={(e) => setDraftResponseText(e.target.value)}
            className="min-h-[120px] text-sm"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={onRegenerateDraft}
              disabled={isRegeneratingDraft}
            >
              {isRegeneratingDraft ? (
                <>
                  <IconLoader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <IconWand className="w-3.5 h-3.5 mr-1.5" />
                  Regenerate
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={onCopy}>
              <IconCopy className="w-3.5 h-3.5 mr-1.5" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base — merged FAQ + Playbook */}
      {hasKnowledgeBase && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <Tabs defaultValue={suggestedFAQs.length > 0 ? "faq" : "playbook"}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="faq" className="text-xs gap-1" disabled={suggestedFAQs.length === 0}>
                  <IconBook className="h-3.5 w-3.5" />
                  FAQ ({suggestedFAQs.length})
                </TabsTrigger>
                <TabsTrigger value="playbook" className="text-xs gap-1" disabled={!hasPlaybook}>
                  <IconHistory className="h-3.5 w-3.5" />
                  Playbook
                </TabsTrigger>
              </TabsList>

              <TabsContent value="faq" className="mt-3">
                <Accordion type="single" collapsible className="w-full">
                  {suggestedFAQs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-sm text-left hover:no-underline py-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={faq.confidence > 80 ? "default" : "secondary"}
                            className="text-[10px] shrink-0"
                          >
                            {faq.confidence}%
                          </Badge>
                          <span className="line-clamp-1">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-md">
                          {faq.answer}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => {
                            setDraftResponseText(
                              draftResponseText +
                                "\n\nRegarding your concern: " +
                                faq.answer
                            );
                            toast.success("FAQ applied to draft");
                          }}
                        >
                          Apply to Draft
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="playbook" className="mt-3">
                {isPlaybookLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ) : hasPlaybook && playbookData ? (
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className="text-xl font-bold">
                          {playbookData.avgResolutionDays != null
                            ? Math.round(playbookData.avgResolutionDays)
                            : "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Avg Days</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className="text-xl font-bold text-green-600">
                          {playbookData.bestResolutionDays ?? "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Best</div>
                      </div>
                    </div>

                    {/* AI Summary */}
                    <p className="text-xs text-muted-foreground bg-accent/10 p-2.5 rounded-md border border-accent/20">
                      {playbookData.aiSummary}
                    </p>

                    {/* Best Practices */}
                    {playbookData.bestPractices.length > 0 && (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="practices">
                          <AccordionTrigger className="text-sm hover:no-underline py-2">
                            <div className="flex items-center gap-2">
                              <IconTrendingUp className="h-3.5 w-3.5 text-green-500" />
                              Best Practices ({playbookData.bestPractices.length})
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                              {playbookData.bestPractices.map((p, idx) => (
                                <li key={idx}>{p}</li>
                              ))}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    <p className="text-[10px] text-muted-foreground">
                      From {playbookData.totalResolved} resolved &ldquo;{caseTopic}&rdquo; cases
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No playbook data available.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Related Training */}
      {relatedTraining.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IconSchool className="h-4 w-4" />
              Related Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {relatedTraining.map((training) => (
              <div
                key={training}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-xs">{training}</span>
                <Link href={`/educate?topic=${encodeURIComponent(training)}`}>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
                    Deploy
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
