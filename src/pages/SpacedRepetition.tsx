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

export default function SpacedRepetition() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [cardCount, setCardCount] = useState("10");
  const [characterMode, setCharacterMode] = useState<"hanzi" | "pinyin">("hanzi");
  const [direction, setDirection] = useState<"zh-en" | "en-zh">("zh-en");

  const parsedCount = useMemo(() => {
    const numeric = Number(cardCount);
    if (Number.isNaN(numeric) || numeric <= 0) return 1;
    return Math.min(200, Math.max(1, Math.round(numeric)));
  }, [cardCount]);

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
            <Button className="w-full sm:w-auto gap-2">
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
      </div>
    </div>
  );
}
