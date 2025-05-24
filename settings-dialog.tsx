
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BellDot, Link2Off, Trash2, Palette as PaletteIcon, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage, getTranslationFunction } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PREDEFINED_THEMES, DEFAULT_THEME_COLORS } from './app-header'; // Assuming these are exported from AppHeader

interface SettingsDialogProps {
  currentTelegramSettings: {
    botToken: string;
    chatId: string;
    enabled: boolean;
  };
  onTelegramSettingsSave: (botToken: string, chatId: string, enabled: boolean) => Promise<void>;
  onTelegramUnlink: () => void;
  onClearAllData: () => void;
  onCloseDialog: () => void;

  predefinedThemes: typeof PREDEFINED_THEMES;
  defaultThemeColors: typeof DEFAULT_THEME_COLORS;
  currentActiveThemeClass: string;
  onSaveActiveThemeClass: (themeClass: string) => void;
  onResetToDefaultTheme: () => void;

  showMotivationalMessageSetting: boolean;
  onToggleMotivationalMessageSetting: (enabled: boolean) => void;
  resolvedTheme: 'light' | 'dark';
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  currentTelegramSettings,
  onTelegramSettingsSave,
  onTelegramUnlink,
  onClearAllData,
  onCloseDialog,
  predefinedThemes,
  defaultThemeColors,
  currentActiveThemeClass,
  onSaveActiveThemeClass,
  onResetToDefaultTheme,
  showMotivationalMessageSetting,
  onToggleMotivationalMessageSetting,
  resolvedTheme,
}) => {
  const { language, t, tFunction } = useLanguage();

  const [dialogTelegramBotToken, setDialogTelegramBotToken] = useState(currentTelegramSettings.botToken);
  const [dialogTelegramChatId, setDialogTelegramChatId] = useState(currentTelegramSettings.chatId);
  const [dialogTelegramNotificationsEnabled, setDialogTelegramNotificationsEnabled] = useState(currentTelegramSettings.enabled);
  const [isClearDataAlertOpen, setIsClearDataAlertOpen] = useState(false);
  const [isResetThemeAlertOpen, setIsResetThemeAlertOpen] = useState(false);

  const [selectedThemeClassInDialog, setSelectedThemeClassInDialog] = useState(currentActiveThemeClass);

  useEffect(() => {
    setSelectedThemeClassInDialog(currentActiveThemeClass);
  }, [currentActiveThemeClass]);

  useEffect(() => {
    setDialogTelegramBotToken(currentTelegramSettings.botToken);
    setDialogTelegramChatId(currentTelegramSettings.chatId);
    setDialogTelegramNotificationsEnabled(currentTelegramSettings.enabled);
  }, [currentTelegramSettings]);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    await onTelegramSettingsSave(dialogTelegramBotToken, dialogTelegramChatId, dialogTelegramNotificationsEnabled);
  };

  const handleUnlink = () => {
    setDialogTelegramBotToken('');
    setDialogTelegramChatId('');
    setDialogTelegramNotificationsEnabled(false);
    onTelegramUnlink();
  };

  const handleConfirmClearData = () => {
    onClearAllData();
    setIsClearDataAlertOpen(false);
    // onCloseDialog(); // Consider if dialog should close after data clear
  };

  const handleSaveTheme = () => {
    onSaveActiveThemeClass(selectedThemeClassInDialog);
  };

  const handleResetTheme = () => {
    onResetToDefaultTheme();
    setSelectedThemeClassInDialog(''); // Reset local radio state to default theme class
    setIsResetThemeAlertOpen(false);
  };

  return (
    <div className="flex flex-col bg-background h-full">
      <DialogHeader className="p-4 sm:p-6 flex flex-row justify-between items-center border-b shrink-0">
        <DialogTitle className="text-xl sm:text-2xl font-semibold">{t('settingsDialog.title')}</DialogTitle>
        {/* Default X close button from DialogContent will handle closing */}
      </DialogHeader>

      <Tabs defaultValue="general" className="flex-grow flex flex-col sm:flex-row min-h-0">
        <TabsList className="flex flex-row sm:flex-col sm:h-auto w-full sm:w-48 md:w-60 border-b sm:border-b-0 sm:border-r p-2 sm:p-4 space-x-1 sm:space-x-0 sm:space-y-1 bg-muted/30 items-stretch justify-start rounded-none shrink-0 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto">
          <TabsTrigger value="general" className="justify-start px-3 py-2 text-sm sm:text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md shrink-0 sm:shrink">
            <SettingsIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t('settingsDialog.generalTab')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="justify-start px-3 py-2 text-sm sm:text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md shrink-0 sm:shrink">
            <PaletteIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t('settingsDialog.appearanceTab')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start px-3 py-2 text-sm sm:text-base data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md shrink-0 sm:shrink">
            <BellDot className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {t('settingsDialog.notificationsTab')}
          </TabsTrigger>
        </TabsList>

        <div className="flex-grow p-4 sm:p-6 overflow-y-auto min-h-0">
          <TabsContent value="general" className="mt-0 space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">{t('settingsDialog.motivationalMessageSectionTitle')}</h3>
               <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/20">
                <Switch
                  id="showMotivationalMessage"
                  checked={showMotivationalMessageSetting}
                  onCheckedChange={onToggleMotivationalMessageSetting}
                  aria-label={t('settingsDialog.showMotivationalMessage')}
                />
                <Label htmlFor="showMotivationalMessage" className="text-sm cursor-pointer flex-grow">
                  {t('settingsDialog.showMotivationalMessage')}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2 px-1">
                 {t('settingsDialog.showMotivationalMessageDescription')}
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">{t('settingsDialog.dataManagementSectionTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('settingsDialog.clearAllDataDescription')}
              </p>
              <AlertDialog open={isClearDataAlertOpen} onOpenChange={setIsClearDataAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="default">
                    <Trash2 className="mr-2 h-4 w-4" /> {t('settingsDialog.clearAllDataButton')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('settingsDialog.clearAllDataConfirmationTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('settingsDialog.clearAllDataConfirmationMessage')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsClearDataAlertOpen(false)}>{t('settingsDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmClearData} className="bg-destructive hover:bg-destructive/90">
                      {t('settingsDialog.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 space-y-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">{t('settingsDialog.selectThemePrompt')}</h3>
              <RadioGroup
                value={selectedThemeClassInDialog}
                onValueChange={(value) => setSelectedThemeClassInDialog(value)}
                className="space-y-3"
              >
                {Object.entries(predefinedThemes).map(([themeId, themeData]) => {
                  const effectiveColors = themeData[resolvedTheme] || themeData.light; // Fallback to light for swatches if somehow mode is undefined
                  const currentThemeNameKey = themeId === '' ? 'settingsDialog.themeDefaultFocusFlow' : themeData.nameKey;
                  
                  // Determine colors for default theme swatches if themeId is for default
                  const defaultSwatchColors = themeId === '' 
                    ? (defaultThemeColors[resolvedTheme] || defaultThemeColors.light)
                    : effectiveColors;

                  return (
                    <div key={themeId} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/30 cursor-pointer">
                      <RadioGroupItem value={themeId} id={themeId} />
                      <Label htmlFor={themeId} className="flex-grow cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm">
                        <div className="flex gap-1.5 mt-1 sm:mt-0 shrink-0">
                            <span className="inline-block w-4 h-4 rounded-sm border" style={{ backgroundColor: defaultSwatchColors.primaryHex }}></span>
                            <span className="inline-block w-4 h-4 rounded-sm border" style={{ backgroundColor: defaultSwatchColors.backgroundHex }}></span>
                            <span className="inline-block w-4 h-4 rounded-sm border" style={{ backgroundColor: defaultSwatchColors.cardHex }}></span>
                        </div>
                        {t(currentThemeNameKey)}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <AlertDialog open={isResetThemeAlertOpen} onOpenChange={setIsResetThemeAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    {t('settingsDialog.resetThemeSettings')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('settingsDialog.confirmResetThemeTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                       {tFunction('settingsDialog', 'confirmResetThemeMessage', resolvedTheme)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsResetThemeAlertOpen(false)}>{t('settingsDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetTheme}>
                      {t('settingsDialog.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleSaveTheme} size="sm" className="w-full sm:w-auto">
                {t('settingsDialog.saveThemeSettings')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">{t('settingsDialog.telegramSectionTitle')}</h3>
            <form onSubmit={handleSaveTelegram} className="space-y-6">
              <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/20">
                <Switch
                  id="telegramNotificationsEnabled"
                  checked={dialogTelegramNotificationsEnabled}
                  onCheckedChange={setDialogTelegramNotificationsEnabled}
                  aria-label={t('settingsDialog.enableTelegramNotifications')}
                />
                <Label htmlFor="telegramNotificationsEnabled" className="text-sm sm:text-base cursor-pointer flex-grow">
                  {t('settingsDialog.enableTelegramNotifications')}
                </Label>
              </div>

              <div className={cn(!dialogTelegramNotificationsEnabled && "opacity-60 pointer-events-none", "space-y-4")}>
                <div className="space-y-1">
                  <Label htmlFor="telegramBotToken" className="text-sm">{t('settingsDialog.telegramBotTokenLabel')}</Label>
                  <Input
                    id="telegramBotToken"
                    type="password"
                    value={dialogTelegramBotToken}
                    onChange={e => setDialogTelegramBotToken(e.target.value)}
                    placeholder={t('settingsDialog.telegramBotTokenPlaceholder')}
                    disabled={!dialogTelegramNotificationsEnabled}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="telegramChatId" className="text-sm">{t('settingsDialog.telegramChatIdLabel')}</Label>
                  <Input
                    id="telegramChatId"
                    type="text"
                    value={dialogTelegramChatId}
                    onChange={e => setDialogTelegramChatId(e.target.value)}
                    placeholder={t('settingsDialog.telegramChatIdPlaceholder')}
                    disabled={!dialogTelegramNotificationsEnabled}
                  />
                </div>
              </div>
              <Separator className="my-4"/>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleUnlink}
                    disabled={!currentTelegramSettings.botToken && !currentTelegramSettings.chatId && !currentTelegramSettings.enabled}
                    className="w-full sm:w-auto"
                  >
                    <Link2Off className="mr-2 h-4 w-4" />
                    {t('settingsDialog.unlinkTelegram')}
                  </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {t('settingsDialog.saveTelegramSettings')}
                </Button>
              </div>
            </form>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsDialog;

    
