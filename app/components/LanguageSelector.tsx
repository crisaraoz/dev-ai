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
        <Label htmlFor="language-select" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 ${isDisabled ? 'opacity-50' : ''}`}>Programming Language</Label>
        <Select value={language} onValueChange={setLanguage} disabled={isDisabled}>
          <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-8 sm:h-10 text-xs sm:text-sm bg-white dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800" id="language-select">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            {PROGRAMMING_LANGUAGES.map((lang) => (
              <SelectItemWithIcon key={lang.value} value={lang.value} icon={lang.icon}>
                {lang.label}
              </SelectItemWithIcon>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-auto">
        <Label className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 ${isDisabled ? 'opacity-50' : ''}`}>Experience Level</Label>
        <Select value={explanationLevel} onValueChange={setExplanationLevel} disabled={isDisabled}>
          <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-8 sm:h-10 text-xs sm:text-sm bg-white dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            {EXPLANATION_LEVELS.map((level) => (
              <SelectItemWithDescription key={level.value} value={level.value} description={level.description}>
                {level.label}
              </SelectItemWithDescription>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <style jsx global>{`
        /* Ensure Radix UI select components are visible in light mode */
        [data-radix-select-trigger] {
          color: var(--foreground) !important;
        }
        
        .light [data-radix-select-trigger], 
        html:not(.dark) [data-radix-select-trigger] {
          color: #000000 !important;
          background-color: #ffffff !important;
          border-color: #e5e7eb !important;
        }
        
        .dark [data-radix-select-trigger] {
          color: #ffffff !important;
          background-color: #000000 !important;
          border-color: #374151 !important;
        }
        
        [data-radix-select-content] {
          background-color: var(--background) !important;
          color: var(--foreground) !important;
        }
        
        .light [data-radix-select-content],
        html:not(.dark) [data-radix-select-content] {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #e5e7eb !important;
        }
        
        .dark [data-radix-select-content] {
          background-color: #000000 !important;
          color: #ffffff !important;
          border-color: #374151 !important;
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector; 