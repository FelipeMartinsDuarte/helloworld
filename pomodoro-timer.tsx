
"use client"

import type { PomodoroMode, Task } from '@/lib/types';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, SkipForward, Settings, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from '@/lib/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { useLanguage, getTranslationFunction } from '@/contexts/language-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface PomodoroTimerProps {
  onSessionComplete: (mode: PomodoroMode, configuredDurationInMinutes: number) => void;
  onActualWorkTimeUpdate: (elapsedMinutes: number) => void;
  activeTaskDetails: Task | null;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onSessionComplete,
  onActualWorkTimeUpdate,
  activeTaskDetails
}) => {
  const { language, t, tFunction } = useLanguage();
  const { toast } = useToast();

  const [workDuration, setWorkDuration] = useLocalStorage<number>('pomodoro-work', 25);
  const [shortBreakDuration, setShortBreakDuration] = useLocalStorage<number>('pomodoro-shortBreak', 5);
  const [longBreakDuration, setLongBreakDuration] = useLocalStorage<number>('pomodoro-longBreak', 15);
  const [longBreakInterval, setLongBreakInterval] = useLocalStorage<number>('pomodoro-longBreakInterval', 4);
  const [isPomodoroModeEnabled, setIsPomodoroModeEnabled] = useLocalStorage<boolean>('pomodoro-modeEnabled', true);

  const [telegramBotToken] = useLocalStorage<string>('telegram-botToken', '');
  const [telegramChatId] = useLocalStorage<string>('telegram-chatId', '');
  const [telegramNotificationsEnabled] = useLocalStorage<boolean>('telegram-notificationsEnabled', false);

  const [dialogWorkDuration, setDialogWorkDuration] = useState(workDuration);
  const [dialogShortBreakDuration, setDialogShortBreakDuration] = useState(shortBreakDuration);
  const [dialogLongBreakDuration, setDialogLongBreakDuration] = useState(longBreakDuration);
  const [dialogLongBreakInterval, setDialogLongBreakInterval] = useState(longBreakInterval);
  const [dialogIsPomodoroModeEnabled, setDialogIsPomodoroModeEnabled] = useState(isPomodoroModeEnabled);

  const [mode, setMode] = useState<PomodoroMode>('work');
  const durations: Record<PomodoroMode, number> = React.useMemo(() => ({
    work: workDuration,
    shortBreak: shortBreakDuration,
    longBreak: longBreakDuration,
  }), [workDuration, shortBreakDuration, longBreakDuration]);

  const initialTimeForCurrentMode = durations[mode] * 60;
  const [timeLeft, setTimeLeft] = useState(initialTimeForCurrentMode);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompletedThisCycle, setPomodorosCompletedThisCycle] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [showRedFlash, setShowRedFlash] = useState(false);

  const currentSessionTotalSecondsRef = useRef(initialTimeForCurrentMode);
  const timeAtLastStartRef = useRef(initialTimeForCurrentMode);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const justPausedPomodoroRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/alarm-sound-effect.mp3');
    }
  }, []);

  useEffect(() => setDialogWorkDuration(workDuration), [workDuration]);
  useEffect(() => setDialogShortBreakDuration(shortBreakDuration), [shortBreakDuration]);
  useEffect(() => setDialogLongBreakDuration(longBreakDuration), [longBreakDuration]);
  useEffect(() => setDialogLongBreakInterval(longBreakInterval), [longBreakInterval]);
  useEffect(() => setDialogIsPomodoroModeEnabled(isPomodoroModeEnabled), [isPomodoroModeEnabled]);

  const playSound = useCallback(() => {
    audioRef.current?.play().catch(error => console.warn("Audio play failed:", error));
  }, []);

  const sendTelegramNotificationForBreakEnd = useCallback(async (message: string) => {
    if (!telegramNotificationsEnabled || !telegramBotToken || !telegramChatId) {
      return { success: false, error: 'Notifications disabled or Token/Chat ID not set' };
    }
    try {
      const response = await fetch('/api/send-telegram-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: telegramBotToken, chatId: telegramChatId, message }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }, [telegramBotToken, telegramChatId, telegramNotificationsEnabled]);

  const handleSessionEndLogic = useCallback(async (isSkipping = false) => {
    const currentMode = mode;
    const originalIsRunningState = isRunning;

    playSound();
    setShowRedFlash(true);
    setTimeout(() => setShowRedFlash(false), 3000);
    setIsRunning(false);

    let durationForLogMinutes: number;

    if (isSkipping) {
      if (currentMode === 'work') {
        if (originalIsRunningState) {
          const elapsedSecondsThisSegment = Math.max(0, timeAtLastStartRef.current - timeLeft);
          durationForLogMinutes = elapsedSecondsThisSegment / 60;
        } else {
          durationForLogMinutes = 0;
        }
      } else {
        durationForLogMinutes = 0;
      }
    } else {
      durationForLogMinutes = currentSessionTotalSecondsRef.current / 60;
    }

    onSessionComplete(currentMode, durationForLogMinutes);

    if (!isPomodoroModeEnabled && activeTaskDetails) {
      toast({
        title: t('pomodoroTimer.taskTimeUpTitle'),
        description: tFunction('pomodoroTimer', 'taskTimeUpDescription', activeTaskDetails.title)
      });
      setMode('work');
      return;
    }

    let nextMode: PomodoroMode;
    let messageKey = "";

    if (currentMode === 'work') {
      const newCompletedPomodoros = pomodorosCompletedThisCycle + 1;
      setPomodorosCompletedThisCycle(newCompletedPomodoros);
      if (newCompletedPomodoros % longBreakInterval === 0) {
        nextMode = 'longBreak';
        messageKey = "timeForLongBreak";
      } else {
        nextMode = 'shortBreak';
        messageKey = "timeForShortBreak";
      }
    } else {
      nextMode = 'work';
      messageKey = "timeToFocus";
    }

    setMode(nextMode);

    toast({ title: t('pomodoroTimer.sessionEnded'), description: t(`pomodoroTimer.${messageKey}`) });

    if ((currentMode === 'shortBreak' || currentMode === 'longBreak') && !isSkipping && telegramNotificationsEnabled && telegramBotToken && telegramChatId) {
      const breakOverMessage = tFunction('pomodoroTimer', 'telegramBreakOverMessage');
      const telegramResult = await sendTelegramNotificationForBreakEnd(breakOverMessage);
      if (!telegramResult.success) {
        toast({
          title: t('pomodoroTimer.telegramNotificationFailed'),
          description: t('pomodoroTimer.telegramNotificationFailedDesc') + ` (${telegramResult.error || 'Unknown error'})`,
          variant: 'destructive',
        });
      }
    }
  }, [
    mode, onSessionComplete, pomodorosCompletedThisCycle, longBreakInterval, toast, setMode,
    setIsRunning, setPomodorosCompletedThisCycle, playSound, t, tFunction,
    telegramBotToken, telegramChatId, telegramNotificationsEnabled,
    isPomodoroModeEnabled, activeTaskDetails, timeLeft, isRunning,
    sendTelegramNotificationForBreakEnd, timeAtLastStartRef
  ]);

  const calculateTaskBasedDurationSeconds = useCallback(() => {
    if (!activeTaskDetails) return workDuration * 60;
    const estimatedTotalMinutes = activeTaskDetails.estimatedTimeUnit === 'hours'
      ? activeTaskDetails.estimatedTime * 60
      : activeTaskDetails.estimatedTime;
    const remainingMinutes = Math.max(0, estimatedTotalMinutes - activeTaskDetails.completedTimeInMinutes);
    return remainingMinutes * 60;
  }, [activeTaskDetails?.estimatedTime, activeTaskDetails?.estimatedTimeUnit, activeTaskDetails?.completedTimeInMinutes, workDuration]);


  const resetTimer = useCallback(() => {
    if (isRunning && (mode === 'work' || !isPomodoroModeEnabled)) {
      const elapsedSeconds = timeAtLastStartRef.current - timeLeft;
      if (elapsedSeconds > 0) {
        onActualWorkTimeUpdate(elapsedSeconds / 60);
      }
    }
    setIsRunning(false);
    justPausedPomodoroRef.current = false; // Ensure flag is cleared on explicit reset

    let newInitialTimeSeconds: number;
    let newMode = mode;

    if (!isPomodoroModeEnabled && activeTaskDetails) {
      newInitialTimeSeconds = calculateTaskBasedDurationSeconds();
      if (newMode !== 'work') newMode = 'work';
    } else {
      newInitialTimeSeconds = durations[newMode] * 60;
      if (!isPomodoroModeEnabled && !activeTaskDetails) {
        if (newMode !== 'work') newMode = 'work';
        newInitialTimeSeconds = workDuration * 60;
      }
    }
    
    if (mode !== newMode) setMode(newMode);
    setTimeLeft(newInitialTimeSeconds);
    currentSessionTotalSecondsRef.current = newInitialTimeSeconds;
    timeAtLastStartRef.current = newInitialTimeSeconds;
  }, [
    isPomodoroModeEnabled,
    mode,
    activeTaskDetails, // Full object for dep check
    calculateTaskBasedDurationSeconds,
    durations,
    workDuration,
    isRunning, // To check if we need to log time
    onActualWorkTimeUpdate,
    timeLeft,
    setMode, // To potentially change mode if needed during reset
    setTimeLeft // To update timeLeft
  ]);

  useEffect(() => {
    if (!hasMounted) {
      justPausedPomodoroRef.current = false; 
      return;
    }
  
    if (isRunning) {
      if (isPomodoroModeEnabled) justPausedPomodoroRef.current = false;
      return;
    }
  
    // At this point, timer is mounted and NOT running.
    if (isPomodoroModeEnabled && justPausedPomodoroRef.current) {
      justPausedPomodoroRef.current = false; // Consume the flag
      // console.log("Pomodoro timer was just paused. timeLeft (" + timeLeft + ") preserved.");
      return; // For Pomodoro mode, if just paused, DO NOT reset timeLeft.
    }
  
    // console.log("Config-change/initial-load useEffect: Resetting timeLeft. Mode:", mode, "isPomodoroModeEnabled:", isPomodoroModeEnabled);
  
    let newInitialTimeSeconds;
    let newMode = mode; // Assume current mode is correct unless task-based logic changes it.
  
    if (isPomodoroModeEnabled) {
      newInitialTimeSeconds = durations[mode] * 60;
    } else { // Task-based mode
      if (activeTaskDetails) {
        newInitialTimeSeconds = calculateTaskBasedDurationSeconds();
        if (newMode !== 'work') newMode = 'work'; // Task-based timing always uses 'work' mode internally
      } else {
        newInitialTimeSeconds = workDuration * 60; // Fallback for task mode if no active task
        if (newMode !== 'work') newMode = 'work';
      }
    }
  
    // If mode needs to be changed (e.g., task-based mode forcing 'work'), update it.
    // This might cause this effect to re-run, which is fine as it will then have the correct mode.
    if (mode !== newMode) {
      setMode(newMode); 
      // When setMode runs, this effect will re-run with the new mode.
      // The subsequent run will correctly calculate newInitialTimeSeconds with the updated mode.
      return; 
    }
  
    setTimeLeft(newInitialTimeSeconds);
    currentSessionTotalSecondsRef.current = newInitialTimeSeconds;
    timeAtLastStartRef.current = newInitialTimeSeconds;
  
  }, [
    isPomodoroModeEnabled,
    mode,
    durations, // This includes workDuration, shortBreakDuration, longBreakDuration
    workDuration, // Also for task-based mode fallback
    ...(isPomodoroModeEnabled ? [] : [ // For task-based mode, these define the session
        activeTaskDetails?.id,
        activeTaskDetails?.estimatedTime,
        activeTaskDetails?.estimatedTimeUnit,
        activeTaskDetails?.completedTimeInMinutes, // This is key for task-based remaining time
    ]),
    hasMounted,
    isRunning, // This effect needs to react when the timer stops or starts for the justPausedPomodoroRef logic
    calculateTaskBasedDurationSeconds, // This function depends on activeTaskDetails and workDuration
    setMode, // If task-based mode needs to enforce 'work' mode
    setTimeLeft // Direct dependency for setting time
  ]);


  useEffect(() => {
    if (!isRunning || !hasMounted) return;

    if (timeLeft <= 0) {
      const elapsedSecondsThisSegment = timeAtLastStartRef.current - 0;
      if ((mode === 'work' || !isPomodoroModeEnabled) && elapsedSecondsThisSegment > 0) {
        onActualWorkTimeUpdate(elapsedSecondsThisSegment / 60);
      }
      handleSessionEndLogic(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, onActualWorkTimeUpdate, handleSessionEndLogic, hasMounted, isPomodoroModeEnabled, timeAtLastStartRef]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (hasMounted) {
      let titleSegment = "";
      if (!isPomodoroModeEnabled && activeTaskDetails?.title) {
        titleSegment = tFunction('pomodoroTimer', 'focusOnTaskTitle', activeTaskDetails.title);
      } else {
         const modeKey = mode === 'work' ? 'workSession' : mode === 'shortBreak' ? 'shortBreakSession' : 'longBreakSession';
         titleSegment = t(`pomodoroTimer.${modeKey}`);
      }
      document.title = `${formatTime(timeLeft)} - ${titleSegment} | FocusFlow`;
    }
  }, [timeLeft, mode, hasMounted, t, isPomodoroModeEnabled, activeTaskDetails, tFunction]);

  const toggleTimer = () => {
    if (!hasMounted) return;

    if (!isRunning) { // ---- STARTING or RESUMING ----
      if (!isPomodoroModeEnabled) { // Task-based mode
        if (!activeTaskDetails) {
          toast({ title: t('pomodoroTimer.noActiveTaskError'), description: t('pomodoroTimer.noActiveTaskDescription'), variant: "destructive" });
          return;
        }
        const taskRemainingSecs = calculateTaskBasedDurationSeconds();
        if (taskRemainingSecs <= 0) {
          toast({ title: t('pomodoroTimer.taskTimeUpTitle'), description: tFunction('pomodoroTimer', 'taskTimeUpDescription', activeTaskDetails.title) });
          return;
        }
        if (mode !== 'work') setMode('work'); // Task mode always runs as 'work'
        setTimeLeft(taskRemainingSecs);
        currentSessionTotalSecondsRef.current = taskRemainingSecs;
        timeAtLastStartRef.current = taskRemainingSecs;

      } else { // Pomodoro mode
        if (mode === 'work' && !activeTaskDetails) {
          toast({ title: t('pomodoroTimer.noActiveTaskError'), description: t('pomodoroTimer.noActiveTaskDescription'), variant: "destructive" });
          return;
        }
        const fullModeDurationSecs = durations[mode] * 60;

        // If timeLeft is positive and less than full duration, it means we are resuming.
        // The timeLeft state itself is already correct (preserved from pause).
        // We only need to set timeAtLastStartRef for the new segment.
        if (timeLeft > 0 && timeLeft < fullModeDurationSecs) {
          timeAtLastStartRef.current = timeLeft; // Start this segment from the paused time.
          currentSessionTotalSecondsRef.current = fullModeDurationSecs; // Progress bar against full session
        } else {
          // Fresh start for this Pomodoro mode (or timer was at 0)
          setTimeLeft(fullModeDurationSecs);
          timeAtLastStartRef.current = fullModeDurationSecs;
          currentSessionTotalSecondsRef.current = fullModeDurationSecs;
        }
      }
      setIsRunning(true);

    } else { // ---- PAUSING ----
      const elapsedSeconds = timeAtLastStartRef.current - timeLeft;
      if ((mode === 'work' || !isPomodoroModeEnabled) && elapsedSeconds > 0) {
        onActualWorkTimeUpdate(elapsedSeconds / 60);
      }
      setIsRunning(false);
      if (isPomodoroModeEnabled) { // Only set flag if pausing a Pomodoro session
        justPausedPomodoroRef.current = true;
      }
    }
  };

  const skipSession = () => {
    if (!isPomodoroModeEnabled || !hasMounted) return;

    const confirmSkipFn = getTranslationFunction< (sessionType: string) => string >(language, 'pomodoroTimer', 'confirmSkip');
    const modeKey = mode === 'work' ? 'workSession' : mode === 'shortBreak' ? 'shortBreakSession' : 'longBreakSession';
    const localizedModeText = t(`pomodoroTimer.${modeKey}`);

    if (window.confirm(confirmSkipFn(localizedModeText))) {
      let wasRunningWhenSkipped = isRunning;
      if (wasRunningWhenSkipped && mode === 'work') {
        const elapsedSecondsThisSegment = Math.max(0, timeAtLastStartRef.current - timeLeft);
        if (elapsedSecondsThisSegment > 0) {
          onActualWorkTimeUpdate(elapsedSecondsThisSegment / 60);
        }
      }
      handleSessionEndLogic(true);
      justPausedPomodoroRef.current = false; // Clear flag on skip too
    }
  };

  const progress = hasMounted && currentSessionTotalSecondsRef.current > 0
    ? ((currentSessionTotalSecondsRef.current - timeLeft) / currentSessionTotalSecondsRef.current) * 100
    : 0;

  const circleRadius = 120;
  const circleStrokeWidth = 12;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const handleTimerSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkDuration(dialogWorkDuration);
    setShortBreakDuration(dialogShortBreakDuration);
    setLongBreakDuration(dialogLongBreakDuration);
    setLongBreakInterval(dialogLongBreakInterval);
    setIsPomodoroModeEnabled(dialogIsPomodoroModeEnabled);
    toast({ title: t('pomodoroTimer.settingsSaved'), description: t('pomodoroTimer.timerSettingsUpdated') });
    setIsSettingsOpen(false);
    justPausedPomodoroRef.current = false; // Clear flag as settings save implies a reset/new state
    // The useEffect for settings changes will handle resetting the timer if needed
    // by calling resetTimer() implicitly as its dependencies change.
  };

  const modeTextMap: Record<PomodoroMode, string> = React.useMemo(() => ({
    work: t('pomodoroTimer.workSession'),
    shortBreak: t('pomodoroTimer.shortBreakSession'),
    longBreak: t('pomodoroTimer.longBreakSession'),
  }),[t]);

  let displayTitle = "";
  if (hasMounted) {
    if (!isPomodoroModeEnabled && activeTaskDetails?.title) {
      displayTitle = tFunction('pomodoroTimer', 'focusOnTaskTitle', activeTaskDetails.title);
    } else {
      displayTitle = modeTextMap[mode];
    }
  }

  const isCriticalTime = timeLeft <= 10 && timeLeft > 0 && isRunning;

  let canStartTimer = true;
  if (hasMounted) {
    if (!isPomodoroModeEnabled && !activeTaskDetails) canStartTimer = false;
    if (isPomodoroModeEnabled && mode === 'work' && !activeTaskDetails) canStartTimer = false;
    if (!isPomodoroModeEnabled && activeTaskDetails && calculateTaskBasedDurationSeconds() <=0) canStartTimer = false;
  }

  const hoursDisplay = Math.floor(timeLeft / 3600);
  let textSizeClass = "text-8xl";
  if (hoursDisplay > 0 ) {
      textSizeClass = "text-7xl";
       if (hoursDisplay >= 100) {
         textSizeClass = "text-6xl";
       }
       if (hoursDisplay >= 1000) {
         textSizeClass = "text-5xl";
       }
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-xl bg-transparent border-none shadow-none transform transition-all duration-300">
        {showRedFlash && (
          <div className="fixed inset-0 bg-red-500/25 z-[150] pointer-events-none animate-pulse" />
        )}
        <CardHeader className="text-center pt-2 pb-0">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            {displayTitle}
            {hasMounted && activeTaskDetails?.title && (isPomodoroModeEnabled && mode === 'work') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-normal text-muted-foreground truncate max-w-[200px] inline-flex items-center gap-1">
                    <Info size={14}/> {t('pomodoroTimer.activeTaskPrefix')} {activeTaskDetails.title}
                  </span>
                </TooltipTrigger>
                <TooltipContent><p>{tFunction('pomodoroTimer', 'focusOnTaskTitle', activeTaskDetails.title)}</p></TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8 py-8">
          <div className="relative w-[320px] h-[320px]">
            <svg className="w-full h-full" viewBox="0 0 264 264">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.7 }} />
                </linearGradient>
              </defs>
              <circle
                className="text-secondary dark:text-secondary/50"
                strokeWidth={circleStrokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={circleRadius}
                cx="132"
                cy="132"
              />
              <circle
                className={cn(
                  "transition-all duration-1000 ease-linear",
                  isRunning && !isCriticalTime && "animate-subtle-pulse"
                )}
                strokeWidth={circleStrokeWidth}
                strokeDasharray={circleCircumference}
                strokeDashoffset={circleCircumference * (1 - (progress / 100))}
                strokeLinecap="round"
                stroke={isCriticalTime ? "hsl(var(--destructive))" : "url(#progressGradient)"}
                fill="transparent"
                r={circleRadius}
                cx="132"
                cy="132"
                transform="rotate(-90 132 132)"
              />
            </svg>
            <div className={cn(
                "absolute inset-0 flex items-center justify-center font-mono font-extrabold",
                textSizeClass
              )} style={{ color: 'hsl(var(--foreground))' }}> {/* Changed to foreground for stability */}
              {(hasMounted && timeLeft !== null) ? formatTime(timeLeft) : "00:00:00"}
            </div>
          </div>
          <Progress value={progress} className={cn("w-full h-3", isCriticalTime ? "[&>*]:bg-destructive" : "")} />
        </CardContent>
        <CardFooter className="flex justify-center gap-3 p-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={resetTimer} aria-label={t('pomodoroTimer.reset')}>
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tooltips.resetTimer')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                onClick={toggleTimer}
                className={cn(
                  "w-32 text-lg",
                  isRunning ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90",
                  (!canStartTimer && !isRunning && hasMounted) && "opacity-50 cursor-not-allowed"
                )}
                aria-label={isRunning ? t('pomodoroTimer.pause') : t('pomodoroTimer.start')}
                disabled={!hasMounted || (!canStartTimer && !isRunning)}
              >
                {isRunning ? <Pause className="mr-2"/> : <Play className="mr-2" />}
                {isRunning ? t('pomodoroTimer.pause') : t('pomodoroTimer.start')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRunning ? t('tooltips.pauseTimer') : t('tooltips.startTimer')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={skipSession}
                aria-label={t('pomodoroTimer.skip')}
                disabled={!isPomodoroModeEnabled || !hasMounted}
              >
                <SkipForward />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tooltips.skipSession')}</p>
            </TooltipContent>
          </Tooltip>
          <Dialog open={isSettingsOpen} onOpenChange={(isOpen) => {
              setIsSettingsOpen(isOpen);
              if (isOpen) {
                  setDialogWorkDuration(workDuration);
                  setDialogShortBreakDuration(shortBreakDuration);
                  setDialogLongBreakDuration(longBreakDuration);
                  setDialogLongBreakInterval(longBreakInterval);
                  setDialogIsPomodoroModeEnabled(isPomodoroModeEnabled);
              }
          }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t('pomodoroTimer.settings')}>
                    <Settings />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('tooltips.timerSettings')}</p>
              </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('pomodoroTimer.timerSettingsTitle')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTimerSettingsSave} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
                <div className="flex items-center space-x-2 p-3 border rounded-md">
                  <Switch
                    id="enablePomodoroMode"
                    checked={dialogIsPomodoroModeEnabled}
                    onCheckedChange={setDialogIsPomodoroModeEnabled}
                  />
                  <Label htmlFor="enablePomodoroMode" className="cursor-pointer flex-grow">{t('pomodoroTimer.enablePomodoroMode')}</Label>
                </div>
                <p className="text-xs text-muted-foreground px-1">
                  {dialogIsPomodoroModeEnabled ? t('pomodoroTimer.pomodoroModeEnabledDesc') : t('pomodoroTimer.pomodoroModeDisabledDesc')}
                </p>

                <fieldset className={cn(!dialogIsPomodoroModeEnabled && "opacity-50 pointer-events-none", "space-y-3")}>
                  <div>
                    <Label htmlFor="workDuration">{t('pomodoroTimer.workDurationLabel')}</Label>
                    <Input id="workDuration" type="number" value={dialogWorkDuration} onChange={e => setDialogWorkDuration(Math.max(1, parseInt(e.target.value)))} min="1" disabled={!dialogIsPomodoroModeEnabled}/>
                  </div>
                  <div>
                    <Label htmlFor="shortBreakDuration">{t('pomodoroTimer.shortBreakDurationLabel')}</Label>
                    <Input id="shortBreakDuration" type="number" value={dialogShortBreakDuration} onChange={e => setDialogShortBreakDuration(Math.max(1, parseInt(e.target.value)))} min="1" disabled={!dialogIsPomodoroModeEnabled}/>
                  </div>
                  <div>
                    <Label htmlFor="longBreakDuration">{t('pomodoroTimer.longBreakDurationLabel')}</Label>
                    <Input id="longBreakDuration" type="number" value={dialogLongBreakDuration} onChange={e => setDialogLongBreakDuration(Math.max(1, parseInt(e.target.value)))} min="1" disabled={!dialogIsPomodoroModeEnabled}/>
                  </div>
                  <div>
                    <Label htmlFor="longBreakInterval">{t('pomodoroTimer.longBreakIntervalLabel')}</Label>
                    <Input id="longBreakInterval" type="number" value={dialogLongBreakInterval} onChange={e => setDialogLongBreakInterval(Math.max(1, parseInt(e.target.value)))} min="1" disabled={!dialogIsPomodoroModeEnabled}/>
                  </div>
                </fieldset>

                <DialogFooter className="mt-6">
                   <DialogClose asChild>
                      <Button type="button" variant="outline">{t('taskList.cancel')}</Button>
                    </DialogClose>
                  <Button type="submit">{t('pomodoroTimer.saveSettings')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default PomodoroTimer;

    