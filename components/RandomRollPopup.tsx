"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dices, X, GripVertical } from "lucide-react";

export default function RandomRollPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [maxNumber, setMaxNumber] = useState(40);
  const [result, setResult] = useState<number | null>(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [generatedNumbers, setGeneratedNumbers] = useState<Set<number>>(
    new Set()
  );
  const popupRef = useRef<HTMLDivElement>(null);

  const generateRandom = () => {
    // If all numbers have been generated, show a message
    if (generatedNumbers.size >= maxNumber) {
      alert(
        `All ${maxNumber} roll numbers have been generated! Please reset or increase the maximum number.`
      );
      return;
    }

    let random: number;
    let attempts = 0;
    const maxAttempts = maxNumber * 10; // Safety limit to prevent infinite loops

    // Keep generating until we find a number that hasn't been used
    do {
      random = Math.floor(Math.random() * maxNumber) + 1;
      attempts++;

      if (attempts > maxAttempts) {
        alert(
          "Error generating unique roll number. Please reset and try again."
        );
        return;
      }
    } while (generatedNumbers.has(random));

    // Add the new number to the set of generated numbers
    setGeneratedNumbers((prev) => new Set(prev).add(random));
    setResult(random);
  };

  const resetGeneratedNumbers = () => {
    setGeneratedNumbers(new Set());
    setResult(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;

    setIsDragging(true);
    const rect = popupRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && popupRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep within viewport
        const maxX = window.innerWidth - popupRef.current.offsetWidth;
        const maxY = window.innerHeight - popupRef.current.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-50"
        title="Random Roll Generator"
      >
        <Dices className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      ref={popupRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      className="select-none"
    >
      <Card className="w-64 bg-slate-900 border-purple-500/50 shadow-2xl shadow-purple-900/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
              <Dices className="h-5 w-5" />
              Roll Generator
            </CardTitle>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="no-drag text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4 no-drag">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Maximum Number</label>
            <Input
              type="number"
              min="1"
              max="1000"
              value={maxNumber}
              onChange={(e) => setMaxNumber(parseInt(e.target.value) || 1)}
              className="bg-slate-950 border-slate-700 text-white"
              placeholder="Enter max number"
            />
          </div>

          {generatedNumbers.size > 0 && (
            <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-700">
              <span className="font-semibold text-purple-400">
                {generatedNumbers.size}
              </span>{" "}
              / {maxNumber} roll numbers generated
            </div>
          )}

          <Button
            onClick={generateRandom}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          >
            <Dices className="mr-2 h-4 w-4" />
            Generate Random Roll
          </Button>

          {generatedNumbers.size > 0 && (
            <Button
              onClick={resetGeneratedNumbers}
              variant="outline"
              className="w-full border-slate-700 text-slate-800 hover:bg-slate-200 hover:text-white"
            >
              Reset Session
            </Button>
          )}

          {result !== null && (
            <div className="text-center p-6 bg-gradient-to-br from-purple-950 to-pink-950 rounded-lg border border-purple-500/30 animate-in fade-in zoom-in">
              <p className="text-sm text-purple-300 mb-1">Roll Number</p>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {result}
              </p>
              <p className="text-xs text-slate-500 mt-2">out of {maxNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
