
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motivationalQuotes, type BilingualQuote } from '@/lib/quotes';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import { usePathname } from 'next/navigation';

interface MotivationalMessageProps {
  showSettingEnabled: boolean;
}

const MotivationalMessage: React.FC<MotivationalMessageProps> = ({ showSettingEnabled }) => {
  const { language, t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<BilingualQuote | null>(null);
  const [isDismissedInSession, setIsDismissedInSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  // Effect 1: Initial session check and quote fetching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('motivationalMessageDismissed');
      if (dismissed === 'true') {
        setIsDismissedInSession(true);
        return; // Don't proceed if dismissed this session
      }
    }

    if (!showSettingEnabled) {
      setIsVisible(false); // Ensure it's hidden if setting is off
      return;
    }

    // Only fetch if enabled and not dismissed
    const fetchAndSetQuote = () => {
      if (motivationalQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        setSelectedQuote(motivationalQuotes[randomIndex]);
        setError(null);
      } else {
        setError("No motivational quotes available.");
      }
    };

    fetchAndSetQuote();

  }, [showSettingEnabled, isDismissedInSession]);


  // Effect 2: Controls visibility based on all conditions (setting, session, quote, route, dialogs)
  useEffect(() => {
    const checkDialogs = () => {
      // Checks for Radix UI Dialogs, AlertDialogs, Sheets etc.
      return !!document.querySelector(
        '[role="dialog"][data-state="open"], [data-radix-dialog-content][data-state="open"], [data-radix-alert-dialog-content][data-state="open"], [data-radix-sheet-content][data-state="open"]'
      );
    };

    let animationTimeoutId: number | undefined;

    const determineVisibility = () => {
      const shouldBeVisible =
        showSettingEnabled &&
        !isDismissedInSession &&
        !!selectedQuote && // A quote must be loaded
        pathname !== '/dashboard' &&
        !checkDialogs();

      if (shouldBeVisible) {
        if (!isVisible) { // Only trigger animation if becoming visible
          // @ts-ignore
          animationTimeoutId = window.setTimeout(() => setIsVisible(true), 500);
        }
      } else {
        if (isVisible) {
          setIsVisible(false);
        }
      }
    };

    determineVisibility(); // Initial check

    // Observe DOM for dialog state changes
    const observer = new MutationObserver(determineVisibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'], // More specific observation
    });

    return () => {
      observer.disconnect();
      if (animationTimeoutId) {
        clearTimeout(animationTimeoutId);
      }
    };
  }, [showSettingEnabled, isDismissedInSession, selectedQuote, pathname, isVisible]);


  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('motivationalMessageDismissed', 'true');
    }
    setIsVisible(false);
    setIsDismissedInSession(true);
  };

  // Render nothing if not visible or no quote/error to show
  if (!isVisible) {
    return null;
  }
  
  const quoteText = selectedQuote ? (language === 'pt-BR' ? selectedQuote.pt : selectedQuote.en) : null;
  const titleText = t('appHeader.motivationalMessage.title');

  return (
    <div className={cn(
      "fixed bottom-5 z-[100]", 
      "inset-x-5 max-w-sm mx-auto", // Centered with side margins for small screens
      "sm:inset-x-auto sm:left-auto sm:right-5 sm:mx-0 sm:w-auto" // Anchored right for sm+
    )}>
      <Card className={cn(
        "w-full", 
        "shadow-xl border-border/60 bg-card/90 backdrop-blur-sm",
        "animate-slide-in-fade-in-bottom-right" // Entrance animation always applied when Card mounts
      )}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-primary">
              {titleText}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
              aria-label={t('motivationalMessage.closeAltText')}
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-foreground/90 pt-0 pb-4">
          {error ? (
            <p className="text-destructive italic">{error}</p>
          ) : quoteText ? (
            <p className="italic">"{quoteText}"</p>
          ) : (
            // This case might not be hit if !selectedQuote makes component return null
            <p className="text-muted-foreground italic">{t('motivationalMessage.loadingQuote')}</p> 
          )}
        </CardContent>
        {error && (
           <CardFooter className="pt-0 pb-3 justify-end">
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              {t('motivationalMessage.dismissButton')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default MotivationalMessage;
