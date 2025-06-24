"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type QuestionType = "SINGLE_CHOICE" | "SHORT_TEXT";

interface Question {
  text: string;
  type: QuestionType;
  options: string[];
}

interface QuestionEditorProps {
  question: Question;
  onChange: (q: Question) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function QuestionEditor({
  question,
  onChange,
  onRemove,
  canRemove,
}: QuestionEditorProps) {
  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[idx] = value;
    onChange({ ...question, options: newOptions });
  };

  const addOption = () => {
    const updated = { ...question, options: [...question.options, ""] };
    onChange(updated);
  };

  const removeOption = (idx: number) => {
    if (question.options.length <= 2) return;
    const newOptions = question.options.filter((_, i) => i !== idx);
    onChange({ ...question, options: newOptions });
  };

  const handleTypeChange = (type: QuestionType) => {
    const updated = {
      ...question,
      type,
      options:
        type === "SINGLE_CHOICE"
          ? question.options.length
            ? question.options
            : ["", ""]
          : [],
    };
    onChange(updated);
  };

  const handleTextChange = (text: string) => {
    onChange({ ...question, text });
  };

  const handleRemove = () => {
    onRemove();
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
      <div>
        <Label htmlFor={`question-${question.text}`} className="mb-2 block">
          Question
        </Label>
        <Input
          id={`question-${question.text}`}
          value={question.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter question"
          required
        />
      </div>

      <div>
        <Label className="mb-2 block">Question Type</Label>
        <Select
          value={question.type}
          onValueChange={(value: QuestionType) => handleTypeChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SINGLE_CHOICE">Multiple Choice</SelectItem>
            <SelectItem value="SHORT_TEXT">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {question.type === "SINGLE_CHOICE" && (
        <div>
          <Label className="mb-2 block">Options</Label>
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  required
                />
                {question.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(idx)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-2"
            >
              Add Option
            </Button>
          </div>
        </div>
      )}

      {canRemove && (
        <div className="pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleRemove}
          >
            Remove Question
          </Button>
        </div>
      )}
    </div>
  );
}
