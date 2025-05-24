
"use client";

import { useTheme } from "next-themes";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User, Moon, Sun, Globe, Palette as PaletteIcon, Settings as SettingsIcon } from 'lucide-react';
import type { Language } from '@/contexts/language-context';
import { useLanguage, getTranslationFunction } from '@/contexts/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import SettingsDialog from '@/components/settings-dialog';
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from '@/lib/hooks/use-local-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { hexToHsl, hslToHex, calculateContrastColor } from '@/lib/utils';
import MotivationalMessage from './motivational-message';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define default theme colors (HEX) - These are the app's original palette
export const DEFAULT_THEME_COLORS = {
  light: {
    primaryHex: '#007BFF',       // Original light primary (soft blue)
    backgroundHex: '#FFFFFF',    // Original light page background (pure white)
    cardHex: '#FFFFFF',          // Original light card background (pure white for To-Do list)
    contrastColorHex: '#000000', // Default contrast (black) for light mode main color
  },
  dark: {
    primaryHex: '#0D6EFD',        // Original dark primary (brighter blue)
    backgroundHex: '#1A202C',    // Original dark page background (dark grey)
    cardHex: '#2D3748',          // Original dark card background (darker grey for To-Do list)
    contrastColorHex: '#FFFFFF', // Default contrast (white) for dark mode main color
  },
};

// Define the Predefined Themes
export const PREDEFINED_THEMES: Record<string, {
  nameKey: string;
  light: { primaryHex: string; backgroundHex: string; cardHex: string; contrastColorHex?: string; };
  dark: { primaryHex: string; backgroundHex: string; cardHex: string; contrastColorHex?: string; };
}> = {
  'default': { // Represents the Focus Flow default theme
    nameKey: 'settingsDialog.themeDefault',
    light: { ...DEFAULT_THEME_COLORS.light },
    dark: { ...DEFAULT_THEME_COLORS.dark },
  },
  'theme-ocean-breeze': {
    nameKey: 'settingsDialog.themeOceanBreeze',
    light: { primaryHex: '#17A2B8', backgroundHex: '#E0F7FA', cardHex: '#B2EBF2' },
    dark: { primaryHex: '#20C997', backgroundHex: '#00333E', cardHex: '#004D40' },
  },
  'theme-sunset-glow': {
    nameKey: 'settingsDialog.themeSunsetGlow',
    light: { primaryHex: '#FF8C00', backgroundHex: '#FFF8E1', cardHex: '#FFECB3' },
    dark: { primaryHex: '#E65100', backgroundHex: '#3E2723', cardHex: '#4E342E' },
  },
  'theme-forest-canopy': {
    nameKey: 'settingsDialog.themeForestCanopy',
    light: { primaryHex: '#28A745', backgroundHex: '#E8F5E9', cardHex: '#C8E6C9' },
    dark: { primaryHex: '#388E3C', backgroundHex: '#1B5E20', cardHex: '#2E7D32' },
  },
  'theme-modern-minimalist': {
    nameKey: 'settingsDialog.themeModernMinimalist',
    light: { primaryHex: '#6C757D', backgroundHex: '#F8F9FA', cardHex: '#E9ECEF' },
    dark: { primaryHex: '#ADB5BD', backgroundHex: '#212529', cardHex: '#343A40' },
  },
  'theme-vibrant-pop': {
    nameKey: 'settingsDialog.themeVibrantPop',
    light: { primaryHex: '#E040FB', backgroundHex: '#FCE4EC', cardHex: '#F8BBD0' },
    dark: { primaryHex: '#D500F9', backgroundHex: '#311B92', cardHex: '#4527A0' },
  },
  'theme-crimson-fire': {
    nameKey: 'settingsDialog.themeCrimsonFire',
    light: {
      primaryHex: '#DC143C',
      contrastColorHex: '#000000', // Explicit black for timer text
      backgroundHex: '#FFF0F5',
      cardHex: '#FFE4E1',
    },
    dark: {
      primaryHex: '#B22222',
      contrastColorHex: '#000000', // Explicit black for timer text
      backgroundHex: '#3C0000',
      cardHex: '#5A0000',
    },
  },
};
export type PredefinedThemeId = keyof typeof PREDEFINED_THEMES;


export default function AppHeader() {
  const { language, setLanguage, t, tFunction } = useLanguage();
  const { toast } = useToast();
  const { theme: activeThemeSetting, resolvedTheme, setTheme } = useTheme();

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const [telegramBotToken, setTelegramBotTokenState] = useLocalStorage<string>('telegram-botToken', '');
  const [telegramChatId, setTelegramChatIdState] = useLocalStorage<string>('telegram-chatId', '');
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabledState] = useLocalStorage<boolean>('telegram-notificationsEnabled', false);

  const [showMotivationalMessageSetting, setShowMotivationalMessageSetting] = useLocalStorage<boolean>('focusflow-showMotivationalMessage', true);
  
  const [activeThemeClass, setActiveThemeClass] = useLocalStorage<string>('focusflow-active-theme-class', ''); // Default to empty string for Focus Flow default

  const applyStyleToDocument = useCallback((variableName: string, value: string | null) => {
    if (typeof document !== 'undefined') {
      if (value) {
        document.documentElement.style.setProperty(variableName, value);
      } else {
        document.documentElement.style.removeProperty(variableName);
      }
    }
  }, []);

  const applyActiveThemeStyles = useCallback(() => {
    if (typeof document === 'undefined' || !resolvedTheme) return;

    const currentMode = resolvedTheme as 'light' | 'dark';
    const themeIdToApply = activeThemeClass && activeThemeClass !== '' ? activeThemeClass : 'default';
    
    const themeConfig = PREDEFINED_THEMES[themeIdToApply] || PREDEFINED_THEMES['default'];
    
    let effectiveColors;
    if (themeConfig) {
       effectiveColors = themeConfig[currentMode];
    } else {
       // Fallback to absolute default if PREDEFINED_THEMES[themeIdToApply] is undefined
       effectiveColors = DEFAULT_THEME_COLORS[currentMode];
    }


    // 1. Calculate and set Contrast Color for timer text
    let finalContrastColorHex = currentMode === 'light' ? '#000000' : '#FFFFFF'; // Default contrasts
    if (effectiveColors.contrastColorHex) {
      finalContrastColorHex = effectiveColors.contrastColorHex;
    } else if (effectiveColors.primaryHex) {
      finalContrastColorHex = calculateContrastColor(effectiveColors.primaryHex);
    }
    // Override for Crimson Fire light mode
    if (themeIdToApply === 'theme-crimson-fire' && currentMode === 'light') {
        finalContrastColorHex = '#000000';
    }
    
    applyStyleToDocument('--user-contrast-color', finalContrastColorHex);
    
    // 2. Save specific background HEX values to localStorage for components to pick up
    // These are used for inline styles by page.tsx and task-list.tsx
    localStorage.setItem(`theme-custom-${currentMode}-homepageBackground-hex`, JSON.stringify(effectiveColors.backgroundHex));
    localStorage.setItem(`theme-custom-${currentMode}-todolistBackground-hex`, JSON.stringify(effectiveColors.cardHex));

    // Dispatch event so page.tsx and task-list.tsx can react to localStorage changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('theme-style-overrides-updated'));
    }

  }, [resolvedTheme, activeThemeClass, applyStyleToDocument]);


  // Effect to apply the theme class to <html> element
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const htmlElement = document.documentElement;
    
    // Remove all known theme classes first
    Object.keys(PREDEFINED_THEMES).forEach(themeKey => {
      if (themeKey !== 'default') { // 'default' is not a class, it's the absence of other theme classes
        htmlElement.classList.remove(themeKey);
      }
    });

    // Add the active theme class if it's not the default
    if (activeThemeClass && activeThemeClass !== '') {
      htmlElement.classList.add(activeThemeClass);
    }
    // After class is applied, re-calculate and apply specific styles like contrast color
    applyActiveThemeStyles();
  }, [activeThemeClass, applyActiveThemeStyles]);


  // Effect to re-apply styles when theme (light/dark) or selected predefined theme changes
  useEffect(() => {
    applyActiveThemeStyles();
  }, [resolvedTheme, activeThemeClass, applyActiveThemeStyles]);


  // Listener for system theme changes (if user setting is "system")
  useEffect(() => {
    const handleSystemThemeChange = () => {
      if (activeThemeSetting === "system") {
        // applyActiveThemeStyles will be triggered by resolvedTheme change
      }
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Listener for when next-themes actually changes the theme attribute
    const handleThemeChangedEvent = () => {
      // applyActiveThemeStyles will be triggered by resolvedTheme change
    };
    window.addEventListener('themeChanged', handleThemeChangedEvent);
    
    // Listener for storage changes (e.g., theme changed in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'focusflow-active-theme-class') {
        setActiveThemeClass(event.newValue || '');
      }
      if (event.key === 'focusflow-showMotivationalMessage') {
        setShowMotivationalMessageSetting(JSON.parse(event.newValue || 'true'));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('themeChanged', handleThemeChangedEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeThemeSetting, setActiveThemeClass, setShowMotivationalMessageSetting, applyActiveThemeStyles]);


  const handleSaveActiveThemeClass = useCallback((newThemeClass: string) => {
    setActiveThemeClass(newThemeClass); // This will trigger the useEffect to apply the class and styles
    toast({ title: t('settingsDialog.themeSettingsSaved') });
  }, [setActiveThemeClass, t, toast]);

  const handleResetToDefaultTheme = useCallback(() => {
    setActiveThemeClass(''); // Set to empty string for default theme
    // applyActiveThemeStyles will be called by the useEffect watching activeThemeClass
    toast({ title: t('settingsDialog.themeSettingsReset') });
  }, [setActiveThemeClass, t, toast]);


  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  const languageNames: Record<Language, string> = {
    'en': 'English',
    'pt-BR': 'Português (Brasil)',
  };

  const sendTelegramMessageHelper = async (message: string, token: string, chatId: string) => {
    if (!token || !chatId) {
      return { success: false, error: 'Token or Chat ID not set' };
    }
    try {
      const response = await fetch('/api/send-telegram-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: token, chatId, message }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const handleTelegramSettingsSave = async (
    newToken: string,
    newChatId: string,
    newEnabledState: boolean
  ) => {
    const oldToken = telegramBotToken;
    const oldChatId = telegramChatId;
    const oldEnabled = telegramNotificationsEnabled;

    setTelegramBotTokenState(newToken);
    setTelegramChatIdState(newChatId);
    setTelegramNotificationsEnabledState(newEnabledState);

    toast({ title: t('settingsDialog.saveTelegramSettings'), description: t('settingsDialog.telegramSettingsUpdated') });

    if (newEnabledState && newToken && newChatId &&
        (newEnabledState !== oldEnabled || newToken !== oldToken || newChatId !== oldChatId)) {
      const welcomeMessage = tFunction('pomodoroTimer', 'telegramWelcomeMessage');
      const telegramResult = await sendTelegramMessageHelper(welcomeMessage, newToken, newChatId);
      if (telegramResult.success) {
        toast({
          title: t('pomodoroTimer.telegramConfirmationSent'),
          description: t('pomodoroTimer.telegramConfirmationSentDesc'),
        });
      } else {
        toast({
          title: t('pomodoroTimer.telegramConfirmationFailed'),
          description: `${t('pomodoroTimer.telegramConfirmationFailedDesc')} (${telegramResult.error || 'Unknown error'})`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleTelegramUnlink = () => {
    setTelegramBotTokenState('');
    setTelegramChatIdState('');
    setTelegramNotificationsEnabledState(false);
    toast({
      title: t('pomodoroTimer.telegramUnlinked'),
      description: t('pomodoroTimer.telegramUnlinkedDesc'),
    });
  };

  const handleClearAllData = () => {
    // Clear task and session data
    localStorage.removeItem('focusflow-tasks');
    localStorage.removeItem('focusflow-sessions');
    localStorage.removeItem('focusflow-recurring-tasks');
    localStorage.removeItem('focusflow-global-tags');
    localStorage.removeItem('focusflow-saved-lists');
    localStorage.removeItem('focusflow-current-list-name');
    
    // Clear Pomodoro settings
    localStorage.removeItem('pomodoro-work');
    localStorage.removeItem('pomodoro-shortBreak');
    localStorage.removeItem('pomodoro-longBreak');
    localStorage.removeItem('pomodoro-longBreakInterval');
    localStorage.removeItem('pomodoro-modeEnabled');
    
    // Clear Telegram settings
    localStorage.removeItem('telegram-botToken');
    localStorage.removeItem('telegram-chatId');
    localStorage.removeItem('telegram-notificationsEnabled');
    
    // Clear motivational message setting
    localStorage.removeItem('focusflow-showMotivationalMessage');
    setShowMotivationalMessageSetting(true);

    // Clear theme selection & specific background localStorage items
    setActiveThemeClass(''); // Resets to default theme class
    localStorage.removeItem('focusflow-active-theme-class');
    const modes: ('light' | 'dark')[] = ['light', 'dark'];
    modes.forEach(mode => {
      localStorage.removeItem(`theme-custom-${mode}-homepageBackground-hex`);
      localStorage.removeItem(`theme-custom-${mode}-todolistBackground-hex`);
    });
    // The useEffect for activeThemeClass will re-run and call applyActiveThemeStyles,
    // which will remove user CSS variables and reset contrast color.

    toast({
      title: t('settingsDialog.clearAllDataSuccessToastTitle'),
      description: t('settingsDialog.clearAllDataSuccessToastDescription')
    });

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    // The useEffect listening to resolvedTheme will trigger applyActiveThemeStyles
     if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('themeChanged')); // For legacy listener, if any
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-end">
          <nav className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild aria-label={t('appHeader.dashboard')}>
                    <Link href="/dashboard">
                      <LayoutDashboard />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('tooltips.dashboard')}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                   <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger
                      className="w-auto min-w-[60px] sm:min-w-[120px] px-3 py-2 h-10 text-sm focus:ring-0 focus:ring-offset-0" 
                      aria-label={t('appHeader.toggleLanguage')}
                    >
                      <Globe className="mr-0 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline"><SelectValue placeholder={t('appHeader.toggleLanguage')} /></span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{languageNames['en']}</SelectItem>
                      <SelectItem value="pt-BR">{languageNames['pt-BR']}</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('tooltips.changeLanguage')}</p>
                </TooltipContent>
              </Tooltip>
              
              <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={t('appHeader.settings')}>
                        <User />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('tooltips.appSettings')}</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent 
                  className="flex flex-col w-[95vw] max-w-md h-auto max-h-[85vh] p-0 overflow-y-auto rounded-lg shadow-2xl 
                            sm:w-[90vw] sm:max-w-xl sm:h-auto sm:max-h-[90vh] 
                            md:max-w-2xl 
                            lg:max-w-3xl 
                            xl:max-w-4xl"
                  onOpenAutoFocus={(e) => e.preventDefault()} 
                >
                  <SettingsDialog
                    currentTelegramSettings={{
                      botToken: telegramBotToken,
                      chatId: telegramChatId,
                      enabled: telegramNotificationsEnabled,
                    }}
                    onTelegramSettingsSave={handleTelegramSettingsSave}
                    onTelegramUnlink={handleTelegramUnlink}
                    onClearAllData={handleClearAllData}
                    onClose={() => setIsSettingsDialogOpen(false)}
                    
                    currentActiveThemeClass={activeThemeClass}
                    onSaveActiveThemeClass={handleSaveActiveThemeClass}
                    onResetToDefaultTheme={handleResetToDefaultTheme}
                    predefinedThemes={PREDEFINED_THEMES}
                    defaultThemeColors={DEFAULT_THEME_COLORS} 
                    resolvedTheme={resolvedTheme || 'light'}
                    
                    showMotivationalMessageSetting={showMotivationalMessageSetting}
                    onToggleMotivationalMessageSetting={setShowMotivationalMessageSetting}
                  />
                </DialogContent>
              </Dialog>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('appHeader.toggleTheme')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">{t('appHeader.toggleTheme')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('tooltips.toggleTheme')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </nav>
        </div>
      </header>
      <MotivationalMessage showSettingEnabled={showMotivationalMessageSetting} />
    </>
  );
}

    
