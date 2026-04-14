import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Plus,
  MessageSquare,
  Tag,
  Trash2,
  Pencil,
  X,
  Search,
  TrendingUp,
} from "lucide-react";

const fmt = (n: number) => n.toLocaleString();

const AdminAITuning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // Fetch top questions
  const { data: questions = [] } = useQuery({
    queryKey: ["bitbot-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bitbot_questions")
        .select("*")
        .order("ask_count", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch tuned answers
  const { data: tunedAnswers = [] } = useQuery({
    queryKey: ["bitbot-tuned-answers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bitbot_tuned_answers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["bitbot-tuned-answers"] });
  };

  const saveTunedAnswer = useMutation({
    mutationFn: async () => {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
      if (keywords.length === 0) throw new Error("Add at least one keyword");

      if (editingId) {
        const { error } = await supabase
          .from("bitbot_tuned_answers")
          .update({ keywords, answer: answerInput, updated_at: new Date().toISOString() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bitbot_tuned_answers")
          .insert({ keywords, answer: answerInput, created_by: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      resetForm();
      toast({ title: editingId ? "Answer updated" : "Answer saved" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("bitbot_tuned_answers")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteAnswer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bitbot_tuned_answers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Answer removed" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setKeywordsInput("");
    setAnswerInput("");
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setKeywordsInput((item.keywords as string[]).join(", "));
    setAnswerInput(item.answer);
    setShowForm(true);
  };

  const totalQuestions = questions.reduce((s, q) => s + (q.ask_count as number), 0);
  const activeAnswers = tunedAnswers.filter((a) => a.is_active).length;

  // Coverage: % of top 20 questions that have a matching tuned answer
  const top20 = questions.slice(0, 20);
  const activeKeywords = tunedAnswers
    .filter((a) => a.is_active)
    .flatMap((a) => (a.keywords as string[]).map((k) => k.toLowerCase()));
  const coveredCount = top20.filter((q) =>
    activeKeywords.some((kw) => (q.normalized_question as string)?.includes(kw))
  ).length;
  const coveragePct = top20.length > 0 ? Math.round((coveredCount / top20.length) * 100) : 0;

  const filteredQuestions = questions.filter((q) =>
    q.normalized_question?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">AI Tuning</h1>
          <p className="text-sm text-muted-foreground">
            See what customers ask BitBot and add curated answers for specific topics
          </p>
        </div>
        <Button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Best Answer
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">{fmt(totalQuestions)}</p>
            <p className="text-xs text-muted-foreground">{questions.length} unique topics</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Tuned Answers</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-display font-bold">{tunedAnswers.length}</p>
            <p className="text-xs text-muted-foreground">{activeAnswers} active</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs text-muted-foreground">Coverage (Top 20)</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-display font-bold ${coveragePct >= 70 ? "text-emerald-400" : coveragePct >= 40 ? "text-amber-400" : "text-red-400"}`}>
              {coveragePct}%
            </p>
            <Progress value={coveragePct} className="h-1.5 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {coveredCount} of {top20.length} top questions covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              {editingId ? "Edit Best Answer" : "Add Best Answer"}
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Keywords (comma-separated)
              </label>
              <Input
                placeholder='e.g. iphone 17, release date, when is iphone 17'
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Best Answer</label>
              <Textarea
                placeholder="The answer BitBot should give when these keywords are detected..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => saveTunedAnswer.mutate()}
                disabled={!keywordsInput.trim() || !answerInput.trim() || saveTunedAnswer.isPending}
              >
                {editingId ? "Update" : "Save"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two columns: Questions + Tuned Answers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Questions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Popular Questions</h2>
            <Badge variant="outline" className="text-[10px]">
              {filteredQuestions.length}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-9 h-8 text-sm"
              placeholder="Filter questions..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {filteredQuestions.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">
                  {questions.length === 0
                    ? "No questions tracked yet. They'll appear as customers use BitBot."
                    : "No questions match your filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-sm flex-1 truncate">{q.normalized_question}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {fmt(q.ask_count as number)}×
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-primary shrink-0"
                    onClick={() => {
                      setKeywordsInput(q.normalized_question || "");
                      setAnswerInput("");
                      setEditingId(null);
                      setShowForm(true);
                    }}
                  >
                    + Answer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tuned Answers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Curated Answers</h2>
            <Badge variant="outline" className="text-[10px]">
              {tunedAnswers.length}
            </Badge>
          </div>

          {tunedAnswers.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">No curated answers yet. Add one to guide BitBot's responses.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {tunedAnswers.map((a) => (
                <Card key={a.id} className={`glass border-border/50 ${!a.is_active ? "opacity-50" : ""}`}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(a.keywords as string[]).map((kw) => (
                          <Badge key={kw} className="text-[10px] bg-primary/20 text-primary border-primary/30">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Switch
                          checked={a.is_active as boolean}
                          onCheckedChange={(checked) =>
                            toggleActive.mutate({ id: a.id, is_active: checked })
                          }
                          className="scale-75"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => startEdit(a)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteAnswer.mutate(a.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{a.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAITuning;
