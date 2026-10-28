import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { filterSkills, getStandardSkillName, isStandardSkill } from '@/lib/skills';

interface SkillAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export default function SkillAutocomplete({
  value,
  onChange,
  onSelect,
  onKeyPress,
  placeholder = 'Type to search skills...',
  className = '',
}: SkillAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions when value changes
  useEffect(() => {
    if (value.trim().length > 0) {
      const filtered = filterSkills(value, 8);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (skill: string) => {
    const standardName = getStandardSkillName(skill);
    onChange(standardName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onSelect) {
      onSelect(standardName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      } else if (onKeyPress) {
        onKeyPress(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    if (value.trim().length > 0 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const isCustomSkill = value.trim().length > 0 && !isStandardSkill(value);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`input-field pr-8 ${className}`}
          autoComplete="off"
          spellCheck="false"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Custom skill indicator */}
      {isCustomSkill && !isOpen && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-amber-500" />
          Custom skill (not in standard list)
        </p>
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto"
          >
            <div className="py-1">
              {suggestions.map((skill, index) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSelect(skill)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    index === highlightedIndex
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{skill}</span>
                  {index === highlightedIndex && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Hint */}
            <div className="border-t border-border px-3 py-2 bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {highlightedIndex >= 0 ? (
                  <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">Enter</kbd> to select</span>
                ) : (
                  <span>Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">Enter</kbd> to select</span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No matches but has input */}
      {value.trim().length > 0 && suggestions.length === 0 && isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl p-3"
        >
          <p className="text-sm text-muted-foreground">
            No matching skills found. Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">Enter</kbd> to add "{value}" as a custom skill.
          </p>
        </motion.div>
      )}
    </div>
  );
}
