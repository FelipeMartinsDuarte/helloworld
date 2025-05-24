
"use client"

import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, PlayCircle, Trash2, Edit3, Clock, CheckSquare, ChevronDown } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onSetActive, onDelete, onEdit }) => {
  const { t, tFunction } = useLanguage();
  const estimatedTimeDisplay = `${task.estimatedTime} ${task.estimatedTimeUnit === 'minutes' ? t('taskList.minutes').toLowerCase() : t('taskList.hours').toLowerCase()}`;
  const completedTimeDisplay = formatDuration(task.completedTimeInMinutes);

  const completedSteps = task.steps?.filter(step => step.isCompleted).length || 0;
  const totalSteps = task.steps?.length || 0;

  const hasExpandableContent = !!task.description || (task.steps && task.steps.length > 0) || (task.tags && task.tags.length > 5);

  return (
    <TooltipProvider>
      <Card className={cn(
        "mb-3 transition-all duration-300 ease-in-out task-item-card", // Added 'task-item-card' for JS
        task.isActive ? "bg-primary/5" : "hover:shadow-md",
        task.isCompleted && "opacity-60 bg-secondary/30"
      )}>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full" disabled={!hasExpandableContent}>
            <AccordionItem value={task.id} className="border-none">
              <div className={cn(
                "flex items-center gap-2 p-3",
                task.isActive && "border-l-4 border-primary"
              )}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                        aria-label={task.isCompleted ? t('taskItem.markIncomplete') : t('taskItem.markComplete')}
                        className={cn("shrink-0 h-8 w-8", task.isCompleted ? "text-green-500" : "text-muted-foreground hover:text-primary")}
                        disabled={task.isCompleted}
                    >
                        {task.isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{task.isCompleted ? t('tooltips.markTaskIncomplete') : t('tooltips.markTaskComplete')}</p></TooltipContent>
                </Tooltip>

                {/* Main task info area - takes available space */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn( "font-medium truncate", task.isCompleted && "line-through text-muted-foreground" )} title={task.title}>
                      {task.title}
                    </p>
                    {task.isActive && !task.isCompleted && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Badge variant="outline" className="text-xs font-semibold border-primary text-primary shrink-0 cursor-default">
                            {t('taskItem.activeBadge')}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent><p>{t('tooltips.activeTaskBadge')}</p></TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-x-2 gap-y-1 flex-wrap mt-0.5">
                      <div className="flex items-center gap-1" title={`${t('taskItem.estimatedTime')} ${estimatedTimeDisplay}`}>
                          <Clock size={12} /> {estimatedTimeDisplay}
                      </div>
                      <div title={`${t('taskItem.timeSpent')} ${completedTimeDisplay}`}> Spent: {completedTimeDisplay} </div>
                      {totalSteps > 0 && (
                          <div className="flex items-center gap-1" title={t('taskItem.steps')}>
                          <CheckSquare size={12} /> {tFunction('taskItem', 'stepCompleted', completedSteps, totalSteps)}
                          </div>
                      )}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {task.tags.slice(0, 5).map(tag => (
                        <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-xs border border-black/20 text-white font-normal px-1.5 py-0.5">
                          {tag.name}
                        </Badge>
                      ))}
                      {task.tags.length > 5 && (
                         <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5">
                            {t('taskList.moreTags', { count: task.tags.length - 5})}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons and Accordion Trigger Group - aligned to the very right */}
                <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                  {!task.isCompleted && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onSetActive(task.id); }}
                            aria-label={task.isActive ? t('taskItem.deactivateButton') : t('taskItem.activateButton')}
                            className={cn("h-7 w-7", task.isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-primary")}
                        >
                            <PlayCircle size={16}/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{task.isActive ? t('tooltips.deactivateTask') : t('tooltips.activateTask')}</p></TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        aria-label={t('taskItem.editButton')}
                        className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                        disabled={task.isCompleted}
                      >
                          <Edit3 size={16}/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('tooltips.editTask')}</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        aria-label={t('taskItem.deleteButton')}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                          <Trash2 size={16}/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{t('tooltips.deleteTask')}</p></TooltipContent>
                  </Tooltip>
                  {hasExpandableContent && (
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <AccordionTrigger // This is the ShadCN AccordionTrigger
                            asChild // It will pass its props (including data-state) to the Button
                            className="p-0 h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-primary data-[state=open]:text-primary"
                            aria-label={t('taskItem.showDetails')}
                          >
                            {/* This Button becomes the actual AccordionPrimitive.Trigger */}
                            {/* It needs the class to rotate its SVG child when its data-state is open */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="[&[data-state=open]>svg]:rotate-180" // Ensures SVG child rotates
                            >
                              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                            </Button>
                          </AccordionTrigger>
                        </TooltipTrigger>
                        <TooltipContent><p className="accordion-tooltip-text">{/* Text set by JS */}</p></TooltipContent>
                     </Tooltip>
                  )}
                </div>
              </div>
             
              <AccordionContent className={cn("pb-4 px-4 pt-0 space-y-3", task.isActive && "bg-primary/10")}>
                  {task.description && (
                       <div className="space-y-2 border-t pt-3 mt-1">
                          <div className="text-sm">
                              <strong className="font-medium text-muted-foreground block mb-0.5">{t('taskItem.description')}</strong>
                              <p className="whitespace-pre-wrap break-words text-foreground/80 text-xs leading-relaxed bg-muted/30 p-2 rounded-md">{task.description}</p>
                          </div>
                      </div>
                  )}
                  {task.steps && task.steps.length > 0 && (
                    <div className={cn("space-y-1.5 pt-3", task.description ? "border-t" : "")}>
                      <strong className="text-sm font-medium text-muted-foreground block mb-1">{t('taskItem.steps')}</strong>
                      <ul className="space-y-1 text-sm list-none pl-0">
                        {task.steps.map(step => (
                          <li key={step.id} className={cn("text-foreground/80 flex items-center gap-1.5 text-xs", step.isCompleted && "line-through text-muted-foreground/70")}>
                            <CheckSquare size={12} className={cn(step.isCompleted ? "text-primary" : "text-muted-foreground/50")} />
                            <span>{step.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {task.tags && task.tags.length > 5 && ( 
                      <div className={cn("space-y-1.5 pt-3", (task.description || (task.steps && task.steps.length > 0)) ? "border-t" : "")}>
                          <strong className="text-sm font-medium text-muted-foreground block mb-1">{t('taskItem.allTags')}</strong>
                          <div className="flex flex-wrap gap-1.5">
                          {task.tags.map(tag => (
                              <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-xs border border-black/20 text-white font-normal px-1.5 py-0.5">
                              {tag.name}
                              </Badge>
                          ))}
                          </div>
                      </div>
                  )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default TaskItem;

// Script to dynamically update tooltip text for accordion
if (typeof document !== 'undefined') {
  // Helper function to initialize observer for a given trigger
  const initAccordionTooltipObserver = (triggerElement: HTMLElement) => {
    const taskItemCard = triggerElement.closest('.task-item-card');
    if (!taskItemCard) return;

    const tooltipTextElement = taskItemCard.querySelector('.accordion-tooltip-text') as HTMLElement | null;
    if (!tooltipTextElement) return;

    const updateTooltip = () => {
      const isOpen = triggerElement.getAttribute('data-state') === 'open';
      const lang = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
      const text = isOpen
        ? (lang === 'pt-BR' ? 'Ocultar detalhes' : 'Hide details')
        : (lang === 'pt-BR' ? 'Mostrar detalhes' : 'Show details');
      tooltipTextElement.textContent = text;
    };

    updateTooltip(); // Initial set

    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
          updateTooltip();
        }
      }
    });
    observer.observe(triggerElement, { attributes: true, attributeFilter: ['data-state'] });
    
    // Store observer on the element to disconnect later if needed, e.g., on component unmount
    // (though for this script, it's global and runs once)
    // @ts-ignore
    triggerElement.accordionTooltipObserver = observer; 
  };

  // Initial scan for existing triggers
  document.querySelectorAll('button[aria-label*="details"], button[aria-label*="detalhes"]').forEach(button => {
    // Check if it's an accordion trigger (the button itself should get data-state)
    // This is a heuristic; ideally, the button would have a specific data-accordion-trigger attribute.
    // For now, we assume any button with this aria-label within a task-item-card context might be it.
    if (button.closest('.task-item-card')) {
       initAccordionTooltipObserver(button as HTMLElement);
    }
  });

  // If TaskItems are dynamically added, this global script won't catch them.
  // A React-idiomatic way would be to handle this with a useEffect inside TaskItem.
  // However, for this global script:
  // Optionally, use a MutationObserver on a higher-level container if new TaskItems can be added dynamically
  // and re-run the querySelectorAll or init for new triggers. This is more complex for a global script.
}
