import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROGRAMMING_LANGUAGES, EXPLANATION_LEVELS } from "./constants";
import SelectItemWithDescription from "./SelectItemWithDescription";
import SelectItemWithIcon from "./SelectItemWithIcon";

interface LanguageSelectorProps {
  language: string;
  setLanguage: (value: string) => void;
  explanationLevel: string;
  setExplanationLevel: (value: string) => void;
  isDisabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  setLanguage,
  explanationLevel,
  setExplanationLevel,
  isDisabled = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start w-full">
      <div className="w-full sm:w-auto">
        <Label htmlFor="language-select" className={`block mb-1 sm:mb-2 text-xs sm:text-sm ${isDisabled ? 'opacity-50' : ''}`}>Programming Language</Label>
        <Select value={language} onValueChange={setLanguage} disabled={isDisabled}>
          <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-8 sm:h-10 text-xs sm:text-sm" id="language-select">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <SelectItemWithIcon key={lang.value} value={lang.value} icon={lang.icon}>
                {lang.label}
              </SelectItemWithIcon>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <Label className={`block mb-1 sm:mb-2 text-xs sm:text-sm ${isDisabled ? 'opacity-50' : ''}`}>Experience Level</Label>
        <Select value={explanationLevel} onValueChange={setExplanationLevel} disabled={isDisabled}>
          <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-8 sm:h-10 text-xs sm:text-sm">
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            {EXPLANATION_LEVELS.map((level) => (
              <SelectItemWithDescription key={level.value} value={level.value} description={level.description}>
                {level.label}
              </SelectItemWithDescription>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSelector; 