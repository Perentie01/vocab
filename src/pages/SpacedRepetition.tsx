import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw } from "lucide-react";

const SAMPLE_DECK = [
  { id: 1, hanzi: "学习", pinyin: "xuéxí", english: "to study" },
  { id: 2, hanzi: "朋友", pinyin: "péngyou", english: "friend" },
  { id: 3, hanzi: "开心", pinyin: "kāixīn", english: "happy" },
  { id: 4, hanzi: "今天", pinyin: "jīntiān", english: "today" },
  { id: 5, hanzi: "咖啡", pinyin: "kāfēi", english: "coffee" },
  { id: 6, hanzi: "工作", pinyin: "gōngzuò", english: "work" },
  { id: 7, hanzi: "时间", pinyin: "shíjiān", english: "time" },
  { id: 8, hanzi: "谢谢", pinyin: "xièxie", english: "thank you" },
] as const;

type CardItem = (typeof SAMPLE_DECK)[number];
type ReviewRating = "easy" | "ok" | "hard" | "very-hard";

interface ReviewLogEntry {
  card: CardItem;
  rating: ReviewRating;
  order: number;
  promptShown: string;
  revealedAnswer: string;
}

export default function SpacedRepetition() {
  const [cardCount, setCardCount] = useState("10");
  const [characterMode, setCharacterMode] = useState<"hanzi" | "pinyin">("hanzi");
  const [direction, setDirection] = useState<"zh-en" | "en-zh">("zh-en");
  const [phase, setPhase] = useState<"setup" | "review" | "summary">("setup");
  const [sessionCards, setSessionCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewLog, setReviewLog] = useState<ReviewLogEntry[]>([]);

  const parsedCount = useMemo(() => {
    const numeric = Number(cardCount);
    if (Number.isNaN(numeric) || numeric <= 0) return 1;
    return Math.min(200, Math.max(1, Math.round(numeric)));
  }, [cardCount]);

  const currentCard = sessionCards[currentIndex];

  const promptText = useMemo(() => {
    if (!currentCard) return "";
    if (direction === "zh-en") {
      return characterMode === "hanzi" ? currentCard.hanzi : currentCard.pinyin;
    }
    return currentCard.english;
  }, [currentCard, direction, characterMode]);

  const answerText = useMemo(() => {
    if (!currentCard) return "";
    if (direction === "zh-en") {
      return currentCard.english;
    }
    return `${currentCard.hanzi} • ${currentCard.pinyin}`;
  }, [currentCard, direction]);

  const totalCards = sessionCards.length;
  const completedCards = phase === "summary" ? totalCards : Math.min(currentIndex, totalCards);
  const accuracy = reviewLog.length
    ? Math.round(
        (reviewLog.filter((entry) => entry.rating === "easy" || entry.rating === "ok").length / reviewLog.length) * 100
      )
    : 0;
  const progressPercent = totalCards ? Math.round((completedCards / totalCards) * 100) : 0;

  function handleStartSession() {
    const randomized = [...SAMPLE_DECK].sort(() => Math.random() - 0.5);
    const take = Math.min(parsedCount, randomized.length);
    setSessionCards(randomized.slice(0, take));
    setPhase("review");
    setCurrentIndex(0);
    setShowAnswer(false);
    setReviewLog([]);
  }

  function handleReveal() {
    setShowAnswer(true);
  }

  function handleRate(rating: ReviewRating) {
    if (!currentCard) return;
    const nextEntry: ReviewLogEntry = {
      card: currentCard,
      rating,
      order: reviewLog.length + 1,
      promptShown: promptText,
      revealedAnswer: answerText,
    };
    setReviewLog((prev) => [...prev, nextEntry]);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalCards) {
      setPhase("summary");
    } else {
      setCurrentIndex(nextIndex);
      setShowAnswer(false);
    }
  }

  return (
    <AppLayout
      title="Review Session"
      subtitle="复习"
      description="Keep your accuracy high with calm daily sessions"
    >
      <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <span>
            {phase === "review" && totalCards
              ? `Card ${Math.min(currentIndex + 1, totalCards)} / ${totalCards}`
              : `${parsedCount} cards queued`}
          </span>
          <span>{accuracy || 0}% accuracy</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-[oklch(0.55_0.2_25)]" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      {phase === "setup" && (
        <section className="space-y-5 rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100/80 p-3 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-600/80">Session Setup</p>
              <h2 className="text-xl font-semibold">Configure your review</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-count">Cards to review</Label>
              <Input
                id="card-count"
                type="number"
                min={1}
                max={200}
                value={cardCount}
                onChange={(event) => setCardCount(event.target.value)}
                className="rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Up to 200 cards per session.</p>
            </div>

            <div className="space-y-2">
              <Label>Card focus</Label>
              <Select value={characterMode} onValueChange={(value: "hanzi" | "pinyin") => setCharacterMode(value)}>
                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hanzi">Hanzi (characters)</SelectItem>
                  <SelectItem value="pinyin">Pinyin (pronunciation)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <RadioGroup
                value={direction}
                onValueChange={(value: "zh-en" | "en-zh") => setDirection(value)}
                className="grid gap-3"
              >
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 p-3 dark:border-slate-700">
                  <RadioGroupItem value="zh-en" id="zh-en" />
                  <div>
                    <p className="font-medium">Chinese → English</p>
                    <p className="text-xs text-slate-500">Recall meanings from characters.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 p-3 dark:border-slate-700">
                  <RadioGroupItem value="en-zh" id="en-zh" />
                  <div>
                    <p className="font-medium">English → Chinese</p>
                    <p className="text-xs text-slate-500">Produce the correct Hanzi or pinyin.</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>

          <Button className="w-full rounded-2xl bg-[oklch(0.55_0.2_25)] py-6 text-lg font-semibold" onClick={handleStartSession}>
            Begin Session
          </Button>
        </section>
      )}

      {phase === "review" && currentCard && (
        <section className="space-y-5">
          <div className="rounded-[2.5rem] border border-white/70 bg-white/95 p-8 text-center shadow-lg dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600/80">Prompt</p>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">{promptText}</p>
            {!showAnswer && direction === "zh-en" && characterMode === "hanzi" && (
              <p className="mt-3 text-sm text-slate-400">Tap reveal to see the meaning and pinyin.</p>
            )}
            {showAnswer && (
              <div className="mt-6 space-y-1 text-slate-700 dark:text-slate-200">
                <p className="text-xs uppercase tracking-[0.35em] text-teal-500">Answer</p>
                <p className="text-3xl font-semibold">{answerText}</p>
                {direction === "zh-en" && <p className="text-lg text-slate-500">{currentCard.pinyin}</p>}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            {!showAnswer ? (
              <Button onClick={handleReveal} className="w-full rounded-2xl py-6 text-lg">
                Show Answer
              </Button>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => handleRate("very-hard")}>
                  Very Hard
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => handleRate("hard")}>
                  Hard
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => handleRate("ok")}>
                  OK
                </Button>
                <Button className="rounded-2xl bg-teal-500 text-white hover:bg-teal-600" onClick={() => handleRate("easy")}>
                  Easy
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "summary" && (
        <section className="space-y-5">
          <div className="rounded-[2rem] border border-white/80 bg-gradient-to-br from-amber-100 to-teal-100 p-6 text-center shadow dark:border-white/5 dark:from-amber-400/20 dark:to-teal-400/20">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-700/80">Session complete</p>
            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Great work!</h3>
            <p className="text-slate-600 dark:text-slate-200">You reviewed {reviewLog.length} cards this round.</p>
          </div>
          {reviewLog.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow dark:border-white/10 dark:bg-slate-900/70">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewLog.map((entry) => (
                    <TableRow key={`${entry.card.id}-${entry.order}`}>
                      <TableCell>{entry.order}</TableCell>
                      <TableCell>{entry.promptShown}</TableCell>
                      <TableCell>{entry.revealedAnswer}</TableCell>
                      <TableCell className="capitalize">{entry.rating.replace("-", " ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setPhase("setup")}>
              Adjust Session
            </Button>
            <Button className="flex-1 rounded-2xl" onClick={handleStartSession}>
              Review Again
            </Button>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
