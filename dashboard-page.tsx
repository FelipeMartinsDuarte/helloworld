
"use client"

import React from 'react';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import type { Task, PomodoroSession, RecurringTask } from '@/lib/types';
import CompletedTasksList from '@/components/dashboard/completed-tasks-list';
import StatsCards from '@/components/dashboard/stats-cards';
import DashboardCharts from '@/components/dashboard/charts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage, getTranslationFunction } from '@/contexts/language-context';

export default function DashboardPage() {
  const { language, t, tFunction } = useLanguage();
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow-tasks', []);
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>('focusflow-sessions', []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_recurringTasks, _setRecurringTasks] = useLocalStorage<RecurringTask[]>('focusflow-recurring-tasks', []);


  const [workDuration] = useLocalStorage<number>('pomodoro-work', 25);
  const [shortBreakDuration] = useLocalStorage<number>('pomodoro-shortBreak', 5);
  const [longBreakDuration] = useLocalStorage<number>('pomodoro-longBreak', 15);
  const { toast } = useToast();


  React.useEffect(() => {
    const needsUpdate = sessions.some(s => s.durationMinutes === 0 || s.durationMinutes === undefined);
    if (needsUpdate) {
      setSessions(prevSessions =>
        prevSessions.map(s => {
          if (s.durationMinutes === 0 || s.durationMinutes === undefined) {
            if (s.type === 'work') return { ...s, durationMinutes: workDuration };
            if (s.type === 'shortBreak') return { ...s, durationMinutes: shortBreakDuration };
            if (s.type === 'longBreak') return { ...s, durationMinutes: longBreakDuration };
          }
          return s;
        })
      );
    }
  }, [sessions, workDuration, shortBreakDuration, longBreakDuration, setSessions]);


  const completedTasks = tasks.filter(task => task.isCompleted);

  const handleRestoreTask = (taskId: string) => {
    const taskToRestore = tasks.find(t => t.id === taskId);
    if (taskToRestore) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, isCompleted: false, completedAt: undefined, isActive: false }
            : task
        )
      );
      toast({
        title: t('dashboardPage.taskRestored'),
        description: tFunction('dashboardPage', 'taskRestoredDescription', taskToRestore.title || 'The task'),
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      const confirmDeleteFn = getTranslationFunction<(taskTitle: string) => string>(language, 'dashboardPage', 'confirmPermanentDelete');
      if (window.confirm(confirmDeleteFn(taskToDelete.title || 'this task'))) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        setSessions(prevSessions => prevSessions.filter(session => session.taskId !== taskId));
        toast({
          title: t('dashboardPage.taskDeleted'),
          description: tFunction('dashboardPage', 'taskDeletedDescription', taskToDelete.title || 'The task'),
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">{t('dashboardPage.dashboard')}</h1>
        <Button variant="outline" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> {t('dashboardPage.backToTimer')}</Link>
        </Button>
      </div>

      <div className="space-y-8">
        <StatsCards tasks={tasks} sessions={sessions} />
        <DashboardCharts
          tasks={tasks}
          sessions={sessions}
          workDuration={workDuration}
          shortBreakDuration={shortBreakDuration}
          longBreakDuration={longBreakDuration}
        />
        <CompletedTasksList
          tasks={completedTasks}
          onRestoreTask={handleRestoreTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
