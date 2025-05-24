
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
    mainColorHex: '#007BFF',       // Original light primary (soft blue)
    contrastColorHex: '#000000',   // Default contrast for light mode (black timer text)
    homepageBackgroundHex: '#FFFFFF', // Original light page background (pure white)
    todolistBackgroundHex: '#FFFFFF', // Original light card background (pure white for To-Do list)
  },
  dark: {
    mainColorHex: '#0D6EFD',        // Original dark primary (brighter blue)
    contrastColorHex: '#FFFFFF',   // Default contrast for dark mode (white timer text)
    homepageBackgroundHex: '#1A202C',  // Original dark page background (dark grey)
    todolistBackgroundHex: '#2D3748',  // Original dark card background (darker grey for To-Do list)
  },
};

// Define the Predefined Themes
export const PREDEFINED_THEMES: Record<string, {
  nameKey: string;
  light: { mainColorHex: string; homepageBackgroundHex: string; todolistBackgroundHex: string; contrastColorHex?: string; };
  dark: { mainColorHex: string; homepageBackgroundHex: string; todolistBackgroundHex: string; contrastColorHex?: string; };
}> = {
  'default-theme': {
    nameKey: 'settingsDialog.themeDefault', // Translation key
    light: { ...DEFAULT_THEME_COLORS.light },
    dark: { ...DEFAULT_THEME_COLORS.dark },
  },
  'ocean-breeze': {
    nameKey: 'settingsDialog.themeOceanBreeze',
    light: { mainColorHex: '#17A2B8', homepageBackgroundHex: '#E0F7FA', todolistBackgroundHex: '#B2EBF2' },
    dark: { mainColorHex: '#20C997', homepageBackgroundHex: '#00333E', todolistBackgroundHex: '#004D40' },
  },
  'sunset-glow': {
    nameKey: 'settingsDialog.themeSunsetGlow',
    light: { mainColorHex: '#FF8C00', homepageBackgroundHex: '#FFF8E1', todolistBackgroundHex: '#FFECB3' },
    dark: { mainColorHex: '#E65100', homepageBackgroundHex: '#3E2723', todolistBackgroundHex: '#4E342E' },
  },
  'forest-canopy': {
    nameKey: 'settingsDialog.themeForestCanopy',
    light: { mainColorHex: '#28A745', homepageBackgroundHex: '#E8F5E9', todolistBackgroundHex: '#C8E6C9' },
    dark: { mainColorHex: '#388E3C', homepageBackgroundHex: '#1B5E20', todolistBackgroundHex: '#2E7D32' },
  },
  'modern-minimalist': {
    nameKey: 'settingsDialog.themeModernMinimalist',
    light: { mainColorHex: '#6C757D', homepageBackgroundHex: '#F8F9FA', todolistBackgroundHex: '#E9ECEF' },
    dark: { mainColorHex: '#ADB5BD', homepageBackgroundHex: '#212529', todolistBackgroundHex: '#343A40' },
  },
  'vibrant-pop': {
    nameKey: 'settingsDialog.themeVibrantPop',
    light: { mainColorHex: '#E040FB', homepageBackgroundHex: '#FCE4EC', todolistBackgroundHex: '#F8BBD0' },
    dark: { mainColorHex: '#D500F9', homepageBackgroundHex: '#311B92', todolistBackgroundHex: '#4527A0' },
  },
  'crimson-fire': {
    nameKey: 'settingsDialog.themeCrimsonFire',
    light: {
      mainColorHex: '#DC143C',
      contrastColorHex: '#000000', // Explicit black for timer text
      homepageBackgroundHex: '#FFF0F5',
      todolistBackgroundHex: '#FFE4E1',
    },
    dark: {
      mainColorHex: '#B22222',
      contrastColorHex: '#000000', // Explicit black for timer text
      homepageBackgroundHex: '#3C0000',
      todolistBackgroundHex: '#5A0000',
    },
  },
};
export type PredefinedThemeId = keyof typeof PREDEFINED_THEMES;


export default function AppHeader() {
  const { language, setLanguage, t, tFunction } = useLanguage();
  const { toast } = useToast();
  const { theme: activeThemeSetting, resolvedTheme, setTheme } = useTheme(); // Correctly get theme values

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const [telegramBotToken, setTelegramBotTokenState] = useLocalStorage<string>('telegram-botToken', '');
  const [telegramChatId, setTelegramChatIdState] = useLocalStorage<string>('telegram-chatId', '');
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabledState] = useLocalStorage<boolean>('telegram-notificationsEnabled', false);

  const [showMotivationalMessageSetting, setShowMotivationalMessageSetting] = useLocalStorage<boolean>('focusflow-showMotivationalMessage', true);
  const [selectedThemeId, setSelectedThemeId] = useLocalStorage<PredefinedThemeId | null>('focusflow-selectedThemeId', null);


  // const applyStyleToDocument = useCallback((variableName: string, value: string | null) => {
  //   if (typeof document !== 'undefined') {
  //     if (value) {
  //       document.documentElement.style.setProperty(variableName, value);
  //     } else {
  //       document.documentElement.style.removeProperty(variableName);
  //     }
  //   }
  // }, []);


  // const applyCustomThemeStyles = useCallback(() => {
  //   if (typeof window === 'undefined') return;
  //   const currentMode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';
  //   const themeIdToApply = selectedThemeId || 'default-theme';
  //   const themeConfig = PREDEFINED_THEMES[themeIdToApply] || PREDEFINED_THEMES['default-theme'];

  //   const effectiveColors = {
  //     mainColorHex: themeConfig[currentMode]?.mainColorHex || DEFAULT_THEME_COLORS[currentMode].mainColorHex,
  //     homepageBackgroundHex: themeConfig[currentMode]?.homepageBackgroundHex || DEFAULT_THEME_COLORS[currentMode].homepageBackgroundHex,
  //     todolistBackgroundHex: themeConfig[currentMode]?.todolistBackgroundHex || DEFAULT_THEME_COLORS[currentMode].todolistBackgroundHex,
  //     contrastColorHex: themeConfig[currentMode]?.contrastColorHex ||
  //                       (currentMode === 'light' ? '#000000' : calculateContrastColor(themeConfig[currentMode]?.mainColorHex || DEFAULT_THEME_COLORS[currentMode].mainColorHex)),
  //   };
    
  //   if (currentMode === 'light' && themeIdToApply !== 'crimson-fire') { // Ensure Crimson Fire's explicit black is respected
  //       effectiveColors.contrastColorHex = '#000000';
  //   }


  //   // 1. Apply Main Color (Primary)
  //   const mainColorHsl = hexToHsl(effectiveColors.mainColorHex);
  //   if (mainColorHsl) {
  //     applyStyleToDocument(`--user-${currentMode}-primary-h`, `${mainColorHsl.h}`);
  //     applyStyleToDocument(`--user-${currentMode}-primary-s`, `${mainColorHsl.s}%`);
  //     applyStyleToDocument(`--user-${currentMode}-primary-l`, `${mainColorHsl.l}%`);
  //   } else {
  //     applyStyleToDocument(`--user-${currentMode}-primary-h`, null);
  //     applyStyleToDocument(`--user-${currentMode}-primary-s`, null);
  //     applyStyleToDocument(`--user-${currentMode}-primary-l`, null);
  //   }
    
  //   // 2. Apply Contrast Color (for timer text primarily)
  //   applyStyleToDocument('--user-contrast-color', effectiveColors.contrastColorHex);
  //   localStorage.setItem('theme-derived-contrastColor-hex', JSON.stringify(effectiveColors.contrastColorHex));

  //   // 3. Apply Homepage Background (Primary Page Background) via localStorage for page.tsx
  //   localStorage.setItem(`theme-custom-${currentMode}-homepageBackground-hex`, JSON.stringify(effectiveColors.homepageBackgroundHex));
  //   // To reflect immediately on global --background if needed for header or other elements:
  //   const homepageBgHsl = hexToHsl(effectiveColors.homepageBackgroundHex);
  //   if (homepageBgHsl) {
  //     applyStyleToDocument(`--user-${currentMode}-homepageBackground-h`, `${homepageBgHsl.h}`);
  //     applyStyleToDocument(`--user-${currentMode}-homepageBackground-s`, `${homepageBgHsl.s}%`);
  //     applyStyleToDocument(`--user-${currentMode}-homepageBackground-l`, `${homepageBgHsl.l}%`);
  //   } else {
  //       applyStyleToDocument(`--user-${currentMode}-homepageBackground-h`, null);
  //       applyStyleToDocument(`--user-${currentMode}-homepageBackground-s`, null);
  //       applyStyleToDocument(`--user-${currentMode}-homepageBackground-l`, null);
  //   }


  //   // 4. Persist To-Do List Background HEX for task-list.tsx to apply inline
  //   localStorage.setItem(`theme-custom-${currentMode}-todolistBackground-hex`, JSON.stringify(effectiveColors.todolistBackgroundHex));


  //   if (typeof window !== 'undefined') {
  //     window.dispatchEvent(new CustomEvent('theme-style-overrides-updated'));
  //   }
  // }, [resolvedTheme, selectedThemeId, applyStyleToDocument]);


  useEffect(() => {
    // applyCustomThemeStyles(); // Temporarily disable to ensure defaults from CSS load correctly
  }, [/* applyCustomThemeStyles */]); // Keep dependency array minimal for now or empty

  // useEffect(() => { // Temporarily disable listeners to avoid JS interference
  //   const handleStorageChange = (event: StorageEvent) => {
  //     const relevantKeys = [
  //       'focusflow-selectedThemeId',
  //       // ... other theme related keys if any are still actively written by settings
  //     ];
  //     if (event.key && (relevantKeys.includes(event.key) || event.key.startsWith('theme-custom-'))) {
  //       // applyCustomThemeStyles();
  //     }
  //      if (event.key === 'focusflow-showMotivationalMessage') {
  //       setShowMotivationalMessageSetting(JSON.parse(event.newValue || 'true'));
  //     }
  //   };
  //   window.addEventListener('storage', handleStorageChange);
    
  //   const handleSystemThemeChange = () => {
  //     if (activeThemeSetting === "system") {
  //       // setTimeout(applyCustomThemeStyles, 0); 
  //     }
  //   };
  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  //   mediaQuery.addEventListener('change', handleSystemThemeChange);
    
  //   const handleThemeChangedEvent = () => { 
  //     // setTimeout(applyCustomThemeStyles, 0);
  //   };
  //   window.addEventListener('themeChanged', handleThemeChangedEvent);

  //   return () => {
  //     window.removeEventListener('storage', handleStorageChange);
  //     mediaQuery.removeEventListener('change', handleSystemThemeChange);
  //     window.removeEventListener('themeChanged', handleThemeChangedEvent);
  //   };
  // }, [/* applyCustomThemeStyles, */ resolvedTheme, activeThemeSetting]);


  const handleSaveThemeSettings = useCallback((newSelectedThemeId: PredefinedThemeId) => {
    setSelectedThemeId(newSelectedThemeId);
    // applyCustomThemeStyles(); // Will be re-triggered by selectedThemeId change via its useEffect dependency
    toast({ title: t('settingsDialog.themeSettingsSaved') });
  }, [setSelectedThemeId, t, toast /*, applyCustomThemeStyles */]);


  const handleResetThemeSettings = useCallback(() => {
    setSelectedThemeId(null); // Setting to null will make applyCustomThemeStyles use 'default-theme'
    // // Clear specific user HSL variables
    // const currentMode = resolvedTheme === 'dark' ? 'dark' : 'light';
    // ['primary', 'homepageBackground'].forEach(target => {
    //   ['h', 's', 'l'].forEach(comp => {
    //     applyStyleToDocument(`--user-${currentMode}-${target}-${comp}`, null);
    //   });
    // });
    // applyStyleToDocument('--user-contrast-color', null);
    // localStorage.removeItem(`theme-custom-${currentMode}-homepageBackground-hex`);
    // localStorage.removeItem(`theme-custom-${currentMode}-todolistBackground-hex`);
    // localStorage.removeItem('theme-derived-contrastColor-hex');

    // applyCustomThemeStyles(); // Re-apply defaults
    toast({ title: t('settingsDialog.themeSettingsReset') });
  }, [setSelectedThemeId, t, toast, resolvedTheme /*, applyStyleToDocument, applyCustomThemeStyles*/]);


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
    setShowMotivationalMessageSetting(true); // Reset to default

    // Clear theme selection
    setSelectedThemeId(null);
    // const modes: ('light' | 'dark')[] = ['light', 'dark'];
    // modes.forEach(mode => {
    //   applyStyleToDocument(`--user-${mode}-primary-h`, null);
    //   applyStyleToDocument(`--user-${mode}-primary-s`, null);
    //   applyStyleToDocument(`--user-${mode}-primary-l`, null);
    //   applyStyleToDocument(`--user-${mode}-homepageBackground-h`, null);
    //   applyStyleToDocument(`--user-${mode}-homepageBackground-s`, null);
    //   applyStyleToDocument(`--user-${mode}-homepageBackground-l`, null);
    //   localStorage.removeItem(`theme-custom-${mode}-homepageBackground-hex`);
    //   localStorage.removeItem(`theme-custom-${mode}-todolistBackground-hex`);
    // });
    // applyStyleToDocument('--user-contrast-color', null);
    // localStorage.removeItem('theme-derived-contrastColor-hex');
    
    // setTimeout(applyCustomThemeStyles, 0); // Re-apply defaults

    toast({
      title: t('settingsDialog.clearAllDataSuccessToastTitle'),
      description: t('settingsDialog.clearAllDataSuccessToastDescription')
    });

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
     if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('themeChanged'));
    }
  }


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
                  className="flex flex-col w-[95vw] max-w-md h-auto max-h-[85vh] p-0 overflow-hidden rounded-lg shadow-2xl 
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
                    
                    currentSelectedThemeId={selectedThemeId || 'default-theme'}
                    onSaveThemeSettings={handleSaveThemeSettings} // Will be a no-op for style changes for now
                    onResetThemeSettings={handleResetThemeSettings} // Will be a no-op for style changes for now
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
