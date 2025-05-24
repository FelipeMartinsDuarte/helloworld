
"use client"

import type { Task, PomodoroSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckSquare, Clock, Coffee } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface StatsCardsProps {
  tasks: Task[];
  sessions: PomodoroSession[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ tasks, sessions }) => {
  const { t } = useLanguage();

  const totalPomodoros = sessions.filter(s => s.type === 'work').length;
  const totalTasksCompleted = tasks.filter(t => t.isCompleted).length;
  
  const totalWorkMinutes = sessions
    .filter(s => s.type === 'work')
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0); 
  
  const totalBreakMinutes = sessions
    .filter(s => s.type === 'shortBreak' || s.type === 'longBreak')
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  const stats = [
    { titleKey: "totalPomodoros", value: totalPomodoros, icon: <Clock className="h-6 w-6 text-primary" />, unitKey: "sessionsUnit" },
    { titleKey: "tasksCompleted", value: totalTasksCompleted, icon: <CheckSquare className="h-6 w-6 text-green-500" />, unitKey: "tasksUnit" },
    { titleKey: "totalWorkTime", value: totalWorkMinutes, icon: <BarChart3 className="h-6 w-6 text-accent" />, unitKey: "minutesUnit" },
    { titleKey: "totalBreakTime", value: totalBreakMinutes, icon: <Coffee className="h-6 w-6 text-purple-500" />, unitKey: "minutesUnit" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(stat => (
        <Card key={stat.titleKey} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t(`statsCards.${stat.titleKey}`)}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{t(`statsCards.${stat.unitKey}`)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;

    