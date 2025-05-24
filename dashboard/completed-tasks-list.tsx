
"use client"

import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCircle, CalendarDays, Clock, ArchiveRestore, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface CompletedTasksListProps {
  tasks: Task[];
  onRestoreTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({ tasks, onRestoreTask, onDeleteTask }) => {
  const { t, tFunction } = useLanguage();

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" />{t('completedTasksList.completedTasks')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('completedTasksList.noTasksCompleted')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" />{t('completedTasksList.completedTasks')} ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-3">
              {tasks.sort((a,b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime() ).map(task => {
                const estimatedMinutes = task.estimatedTimeUnit === 'hours' ? task.estimatedTime * 60 : task.estimatedTime;
                const difference = estimatedMinutes - task.completedTimeInMinutes;
                let productivityMetricDisplay = null;
                if (task.isCompleted && task.completedTimeInMinutes > 0) { // Ensure time was actually spent
                  if (difference > 0) {
                    productivityMetricDisplay = (
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400" title={tFunction('completedTasksList', 'minutesOfProductivity', difference)}>
                        <TrendingUp size={12} /> {tFunction('completedTasksList', 'minutesOfProductivity', difference)}
                      </div>
                    );
                  } else if (difference < 0) {
                    productivityMetricDisplay = (
                      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400" title={tFunction('completedTasksList', 'minutesOfDelay', Math.abs(difference))}>
                        <AlertTriangle size={12} /> {tFunction('completedTasksList', 'minutesOfDelay', Math.abs(difference))}
                      </div>
                    );
                  }
                }

                return (
                  <li key={task.id} className="p-3 border rounded-md shadow-sm bg-card hover:bg-secondary/30 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-grow min-w-0">
                        <span className="font-medium block truncate" title={task.title}>{task.title}</span>
                        {task.completedAt && (
                           <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <CalendarDays size={14} />
                              {t('completedTasksList.completed')}: {format(parseISO(task.completedAt), 'MMM d, yyyy HH:mm')}
                           </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onRestoreTask(task.id)}
                              className="shrink-0"
                              aria-label={`${t('completedTasksList.restore')} ${task.title}`}
                            >
                              <ArchiveRestore className="mr-2 h-4 w-4" /> {t('completedTasksList.restore')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('tooltips.restoreTask')}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onDeleteTask(task.id)}
                              className="shrink-0"
                              aria-label={`${t('completedTasksList.delete')} ${task.title}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> {t('completedTasksList.delete')}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('tooltips.deleteTaskPermanently')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-x-4 gap-y-1 flex-wrap">
                      <div className="flex items-center gap-1" title={`${t('taskItem.estimatedTime')}`}>
                        <Clock size={12} />
                        {t('completedTasksList.estTimeLabel')} {task.estimatedTime} {task.estimatedTimeUnit === 'minutes' ? t('taskList.minutes').toLowerCase() : t('taskList.hours').toLowerCase()}
                      </div>
                      <div title={`${t('taskItem.timeSpent')}`}>
                        {t('completedTasksList.spentTimeLabel')} {formatDuration(task.completedTimeInMinutes)}
                      </div>
                      {productivityMetricDisplay}
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default CompletedTasksList;
