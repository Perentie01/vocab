import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Moon, Sun, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-orange-100 dark:border-slate-700 elevation-2">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-orange-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spaced Repetition</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Card className="p-6 elevation-2 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Session Setup</p>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configure your review</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card-count">Cards to review</Label>
              <Input
                id="card-count"
                type="number"
                min={1}
                max={200}
                value={cardCount}
                onChange={(event) => setCardCount(event.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Up to 200 cards per session. We will start with {parsedCount}.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Card focus</Label>
              <Select value={characterMode} onValueChange={(value: "hanzi" | "pinyin") => setCharacterMode(value)}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Select a focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hanzi">Hanzi (characters)</SelectItem>
                  <SelectItem value="pinyin">Pinyin (pronunciation)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose how each prompt is displayed.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Direction</Label>
              <RadioGroup
                value={direction}
                onValueChange={(value: "zh-en" | "en-zh") => setDirection(value)}
                className="grid gap-3 sm:grid-cols-2"
              >
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-700 p-3 cursor-pointer">
                  <RadioGroupItem value="zh-en" id="zh-en" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Chinese → English</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recall meanings from characters.</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-700 p-3 cursor-pointer">
                  <RadioGroupItem value="en-zh" id="en-zh" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">English → Chinese</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Produce the correct Hanzi or pinyin.</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Next session: {parsedCount} cards • {characterMode === "hanzi" ? "Hanzi" : "Pinyin"}</p>
              <p>{direction === "zh-en" ? "Chinese prompts" : "English prompts"}</p>
            </div>
            <Button className="w-full sm:w-auto gap-2" onClick={handleStartSession}>
              Start Session
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5 elevation-1 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming reviews</p>
            <p className="text-3xl font-semibold text-orange-600">{parsedCount}</p>
          </Card>
          <Card className="p-5 elevation-1 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Focus</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {characterMode === "hanzi" ? "Characters first" : "Pronunciation cues"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {direction === "zh-en" ? "Show Chinese prompts" : "Show English prompts"}
            </p>
          </Card>
        </div>

        <Card className="p-6 elevation-2 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily review</p>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interactive card session</h2>
              </div>
              {phase !== "setup" && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Card {Math.min(currentIndex + 1, totalCards)} of {totalCards || parsedCount}
                </p>
              )}
            </div>

            {phase === "setup" && (
              <div className="rounded-2xl border border-dashed border-orange-200 dark:border-slate-600 p-6 text-center text-gray-500 dark:text-gray-400">
                Configure a session above and tap "Start Session" to begin reviewing cards with a slick flip animation.
              </div>
            )}

            {phase === "review" && currentCard && (
              <>
                <div className="relative h-64 [perspective:1500px]">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-3xl bg-white/80 dark:bg-slate-900/70 border border-orange-100 dark:border-slate-700 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] [transform-style:preserve-3d]",
                      showAnswer ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                    )}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-gray-900 dark:text-white [backface-visibility:hidden]">
                      <p className="text-sm uppercase tracking-wide text-orange-500">Prompt</p>
                      <p className="text-4xl font-semibold tracking-tight">{promptText}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {direction === "zh-en" ? "What is the meaning?" : "Produce the Chinese equivalent."}
                      </p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-gray-900 dark:text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <p className="text-sm uppercase tracking-wide text-teal-500">Answer</p>
                      <p className="text-3xl font-semibold tracking-tight">{answerText}</p>
                      {direction === "zh-en" && (
                        <p className="text-lg text-gray-500 dark:text-gray-300">{currentCard.pinyin}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {showAnswer ? "Log how well you recalled it" : "Flip the card to reveal the answer"}
                    </p>
                  </div>
                  {!showAnswer ? (
                    <Button onClick={handleReveal} className="gap-2">
                      Reveal answer
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => handleRate("very-hard")}>Very hard</Button>
                      <Button variant="outline" onClick={() => handleRate("hard")}>Hard</Button>
                      <Button variant="outline" onClick={() => handleRate("ok")}>OK</Button>
                      <Button onClick={() => handleRate("easy")} className="bg-teal-500 hover:bg-teal-600">
                        Easy
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {phase === "summary" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-r from-orange-100 to-teal-100 dark:from-orange-900/20 dark:to-teal-900/20 p-6 text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Great work!</h3>
                  <p className="text-gray-600 dark:text-gray-300">You reviewed {reviewLog.length} cards this session.</p>
                </div>
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
                <div className="flex flex-wrap justify-end gap-3">
                  <Button variant="ghost" onClick={() => setPhase("setup")}>Adjust session</Button>
                  <Button onClick={handleStartSession}>Review again</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
