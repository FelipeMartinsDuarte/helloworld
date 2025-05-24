
"use client"

import type { Task, Tag, TaskStep, RecurringTask } from '@/lib/types';
import React, { useState, useEffect, useCallback } from 'react';
import TaskItem from './task-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ListChecks, Trash2, X, Repeat, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, getTranslationFunction } from '@/contexts/language-context';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { useTheme } from 'next-themes'; // No longer needed for cardBgStyle

interface TaskListProps {
  tasks: Task[];
  recurringTasks: RecurringTask[];
  setRecurringTasks: React.Dispatch<React.SetStateAction<RecurringTask[]>>;
  onAddTask: (taskData: Omit<Task, 'id' | 'completedTimeInMinutes' | 'isActive' | 'isCompleted' | 'createdAt' | 'completedAt'>) => void;
  onToggleComplete: (id: string) => void;
  onSetActive: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  recurringTasks,
  setRecurringTasks,
  onAddTask,
  onToggleComplete,
  onSetActive,
  onDeleteTask,
  onUpdateTask
}) => {
  const { language, t, tFunction } = useLanguage();
  const { toast } = useToast();
  // const { resolvedTheme } = useTheme(); // No longer needed

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimatedTime, setNewTaskEstimatedTime] = useState(25);
  const [newTaskEstimatedTimeUnit, setNewTaskEstimatedTimeUnit] = useState<'minutes' | 'hours'>('minutes');

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [description, setDescription] = useState('');
  const [currentTags, setCurrentTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#cccccc');
  const [currentSteps, setCurrentSteps] = useState<TaskStep[]>([]);
  const [newStepText, setNewStepText] = useState('');
  
  const [globalTags, setGlobalTags] = useLocalStorage<Tag[]>('focusflow-global-tags', []);
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  const [isRecurringTaskDialogOpen, setIsRecurringTaskDialogOpen] = useState(false);
  const [recurringTaskToDelete, setRecurringTaskToDelete] = useState<RecurringTask | null>(null);
  // const [cardBgStyle, setCardBgStyle] = useState<React.CSSProperties>({}); // Removed, card will use global --card

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // useEffect(() => { // Removed as TaskList card will rely on global --card variable from globals.css
  //   const applyTodolistBackground = () => {
  //     // ...
  //   };
  //   // ...
  // }, [resolvedTheme, hasMounted]);
  

  const resetFormFields = useCallback(() => {
    setNewTaskTitle('');
    setNewTaskEstimatedTime(25);
    setNewTaskEstimatedTimeUnit('minutes');
    setDescription('');
    setCurrentTags([]);
    setNewTagName('');
    setNewTagColor('#cccccc');
    setCurrentSteps([]);
    setNewStepText('');
    setIsAdvancedMode(false);
    setSuggestedTags([]);
  }, []);
  
  const populateFormWithTask = useCallback((task: Task | RecurringTask) => {
    setNewTaskTitle(task.title);
    setNewTaskEstimatedTime(task.estimatedTime);
    setNewTaskEstimatedTimeUnit(task.estimatedTimeUnit);
    setDescription(task.description || '');
    setCurrentTags(task.tags ? task.tags.map(tag => ({...tag})) : []); 
    
    const stepsToSet = task.steps ? task.steps.map(step => ({...step})) : []; 
    if ('id' in task && !('isActive' in task)) { 
        setCurrentSteps(stepsToSet.map(s => ({...s, isCompleted: false})));
    } else { 
        setCurrentSteps(stepsToSet);
    }

    if (task.description || (task.tags && task.tags.length > 0) || (task.steps && task.steps.length > 0)) {
      setIsAdvancedMode(true);
    } else {
      setIsAdvancedMode(false); 
    }
  }, []);


  useEffect(() => {
    if (isFormOpen) {
      if (editingTask) {
        populateFormWithTask(editingTask);
      } else {
        resetFormFields();
      }
    } else {
      resetFormFields();
      setEditingTask(null);
    }
  }, [editingTask, isFormOpen, populateFormWithTask, resetFormFields]);

  useEffect(() => {
    if (newTagName.trim() === '') {
      setSuggestedTags([]);
      return;
    }
    const lcNewTagName = newTagName.toLowerCase();
    const filtered = globalTags.filter(gt =>
      gt.name.toLowerCase().startsWith(lcNewTagName) && !currentTags.find(ct => ct.name.toLowerCase() === gt.name.toLowerCase())
    );
    setSuggestedTags(filtered.slice(0, 5));

    const exactMatch = globalTags.find(gt => gt.name.toLowerCase() === lcNewTagName);
    if (exactMatch) {
      setNewTagColor(exactMatch.color);
    }
  }, [newTagName, globalTags, currentTags]);


  const handleAddTag = () => {
    const trimmedNewTagName = newTagName.trim();
    if (trimmedNewTagName && currentTags.length < 15 && !currentTags.find(ct => ct.name.toLowerCase() === trimmedNewTagName.toLowerCase())) {
      const existingGlobalTag = globalTags.find(gt => gt.name.toLowerCase() === trimmedNewTagName.toLowerCase());
      let tagToAdd: Tag;
      if (existingGlobalTag) {
        tagToAdd = { ...existingGlobalTag, id: crypto.randomUUID() }; 
      } else {
        tagToAdd = { id: crypto.randomUUID(), name: trimmedNewTagName, color: newTagColor };
        setGlobalTags(prevGlobalTags => {
          if (!prevGlobalTags.find(gt => gt.name.toLowerCase() === trimmedNewTagName.toLowerCase())) {
            return [...prevGlobalTags, { id: crypto.randomUUID(), name: trimmedNewTagName, color: newTagColor }];
          }
          return prevGlobalTags;
        });
      }
      setCurrentTags(prev => [...prev, tagToAdd]);
      setNewTagName('');
      setNewTagColor('#cccccc'); 
      setSuggestedTags([]);
    }
  };

  const handleRemoveTag = (tagIdToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag.id !== tagIdToRemove));
  };

  const handleAddStep = () => {
    if (newStepText.trim() && currentSteps.length < 20) { 
      setCurrentSteps([...currentSteps, { id: crypto.randomUUID(), text: newStepText.trim(), isCompleted: false }]);
      setNewStepText('');
    }
  };

  const handleRemoveStep = (stepIdToRemove: string) => {
    setCurrentSteps(currentSteps.filter(step => step.id !== stepIdToRemove));
  };

  const handleToggleStep = (stepIdToToggle: string) => {
    setCurrentSteps(currentSteps.map(step =>
      step.id === stepIdToToggle ? { ...step, isCompleted: !step.isCompleted } : step
    ));
  };

  const handleSubmit = () => { 
    if (newTaskTitle.trim() === '' || newTaskEstimatedTime <= 0) return;
    const timeInHours = newTaskEstimatedTimeUnit === 'hours' ? newTaskEstimatedTime : newTaskEstimatedTime / 60;
    if (timeInHours > 9999) {
      toast({ title: t('taskList.errorTimeLimitTitle'), description: t('taskList.errorTimeLimitDescription'), variant: 'destructive' });
      return;
    }
    const trimmedDescription = description.trim();
    const taskDataPayload = {
      title: newTaskTitle.trim(),
      estimatedTime: newTaskEstimatedTime,
      estimatedTimeUnit: newTaskEstimatedTimeUnit,
      description: isAdvancedMode ? (trimmedDescription === "" ? undefined : trimmedDescription) : undefined,
      tags: isAdvancedMode && currentTags.length > 0 ? currentTags.map(tag => ({id: tag.id, name: tag.name, color: tag.color})) : undefined,
      steps: isAdvancedMode && currentSteps.length > 0 ? currentSteps.map(step => ({...step})) : undefined,
    };
    if (editingTask) {
      onUpdateTask({ ...editingTask, ...taskDataPayload });
    } else {
      onAddTask(taskDataPayload);
    }
    closeDialog();
  };

  const handleSaveAsRecurringTask = () => {
    if (newTaskTitle.trim() === '' || newTaskEstimatedTime <= 0) {
        toast({ title: t('taskList.errorTimeLimitTitle'), description: "Title and estimated time are required.", variant: "destructive"});
        return;
    }
    const trimmedDescription = description.trim();
     const newRecurring: RecurringTask = {
        id: crypto.randomUUID(),
        title: newTaskTitle.trim(),
        estimatedTime: newTaskEstimatedTime,
        estimatedTimeUnit: newTaskEstimatedTimeUnit,
        description: isAdvancedMode ? (trimmedDescription === "" ? undefined : trimmedDescription) : undefined,
        tags: isAdvancedMode && currentTags.length > 0 ? currentTags.map(t => ({id: crypto.randomUUID(), name: t.name, color: t.color})) : undefined, 
        steps: isAdvancedMode && currentSteps.length > 0 ? currentSteps.map(s => ({id: crypto.randomUUID(), text: s.text, isCompleted: false })) : undefined, 
    };
    setRecurringTasks(prev => [...prev, newRecurring]);
    toast({ title: t('taskList.recurringTaskSaved'), description: tFunction('taskList', 'recurringTaskSavedDescription', newRecurring.title) });
  };

  const handleSelectRecurringTask = (recurringTask: RecurringTask) => {
    populateFormWithTask(recurringTask);
    setIsRecurringTaskDialogOpen(false);
  };

  const openDeleteRecurringTaskConfirm = (recTask: RecurringTask) => {
    setRecurringTaskToDelete(recTask);
  };

  const confirmDeleteRecurringTask = () => {
    if (recurringTaskToDelete) {
      setRecurringTasks(prev => prev.filter(rt => rt.id !== recurringTaskToDelete.id));
      toast({ title: t('taskList.recurringTaskDeleted'), description: tFunction('taskList', 'recurringTaskDeletedDescription', recurringTaskToDelete.title), variant: "destructive" });
      setRecurringTaskToDelete(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteFromDialog = () => {
    if (editingTask) {
      const confirmDeleteFn = getTranslationFunction<(taskTitle: string) => string>(language, 'taskList', 'confirmDelete');
      if (window.confirm(confirmDeleteFn(editingTask.title || t('taskList.thisTaskFallback') ))) {
        onDeleteTask(editingTask.id);
        closeDialog();
      }
    }
  };

  const closeDialog = () => {
    resetFormFields(); 
    setEditingTask(null); 
    setIsFormOpen(false); 
  }

  const pendingTasks = tasks.filter(task => !task.isCompleted);

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col shadow-lg"> {/* Removed inline style, relies on global --card */}
        <CardHeader className="flex flex-row items-center justify-between shrink-0">
          <CardTitle className="text-2xl flex items-center gap-2"><ListChecks className="text-primary"/>{t('taskList.toDoList')}</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen); 
            if (!isOpen) { closeDialog(); } else if (!editingTask) { resetFormFields(); }
          }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button size="sm" className="transition-transform duration-200 hover:scale-105" onClick={() => { setEditingTask(null); setIsFormOpen(true);  }}>
                    <PlusCircle className="mr-2 h-5 w-5" /> {t('taskList.addTask')}
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>{t('tooltips.addTask')}</p></TooltipContent>
            </Tooltip>
            <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-0 shrink-0">
                <DialogTitle>{editingTask ? t('taskList.editTask') : t('taskList.addNewTask')}</DialogTitle>
              </DialogHeader>
              
              <div className="px-6 pt-2 pb-4 shrink-0">
                  <div className="flex items-center space-x-2">
                      <Switch id="advancedMode" checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
                      <Label htmlFor="advancedMode" className="text-sm font-normal text-muted-foreground cursor-pointer">
                          {t('taskList.switchToAdvancedCreation')}
                      </Label>
                  </div>
              </div>

              <div className="flex-grow overflow-y-auto px-6"> {/* This div handles scrolling for form content */}
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4 pb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-grow">
                      <Label htmlFor="taskTitle">{t('taskList.taskTitleLabel')}</Label>
                      <Input id="taskTitle" type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder={t('taskList.taskTitlePlaceholder')} required className="mt-1" />
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="mt-6 shrink-0" onClick={() => setIsRecurringTaskDialogOpen(true)}> <Repeat /> </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltips.useRecurringTask')}</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <Label htmlFor="taskEstimatedTime">{t('taskList.estimatedTimeLabel')}</Label>
                      <Input id="taskEstimatedTime" type="number" value={newTaskEstimatedTime} onChange={(e) => setNewTaskEstimatedTime(Math.max(1, parseInt(e.target.value) || 1))} min="1" required className="mt-1" />
                    </div>
                    <div className="w-1/3">
                      <Label htmlFor="taskEstimatedTimeUnit">{t('taskList.unitLabel')}</Label>
                      <Select value={newTaskEstimatedTimeUnit} onValueChange={(value: 'minutes' | 'hours') => setNewTaskEstimatedTimeUnit(value)} >
                        <SelectTrigger id="taskEstimatedTimeUnit" className="mt-1"> <SelectValue placeholder={t('taskList.unitLabel')} /> </SelectTrigger>
                        <SelectContent> <SelectItem value="minutes">{t('taskList.minutes')}</SelectItem> <SelectItem value="hours">{t('taskList.hours')}</SelectItem> </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {isAdvancedMode && (
                    <>
                      <div>
                        <Label htmlFor="taskDescription">{t('taskList.description')}</Label>
                        <Textarea id="taskDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('taskList.descriptionPlaceholder')} className="mt-1 min-h-[80px]" />
                      </div>
                      <div>
                        <Label>{t('taskList.tags')}</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value.slice(0,30))} placeholder={t('taskList.tagNamePlaceholder')} className="flex-grow" maxLength={30} />
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-16 p-1 shrink-0" title={t('taskList.tagColor')} />
                            </TooltipTrigger>
                            <TooltipContent><p>{t('tooltips.pickTagColor')}</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">{t('taskList.addTag')}</Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('tooltips.addTag')}</p></TooltipContent>
                          </Tooltip>
                        </div>
                        {suggestedTags.length > 0 && (
                          <div className="mt-2 space-x-1 space-y-1 border p-2 rounded-md bg-muted/20">
                            <span className="text-xs text-muted-foreground mr-1">{t('taskList.suggestedTags')}:</span>
                            {suggestedTags.map(tag => ( <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="cursor-pointer hover:opacity-80 text-xs text-white border border-black/10" onClick={() => { setNewTagName(tag.name); setNewTagColor(tag.color); setSuggestedTags([]); }}> {tag.name} </Badge> ))}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {currentTags.map(tag => ( <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-xs text-white border border-black/10"> {tag.name} <button type="button" onClick={() => handleRemoveTag(tag.id)} className="ml-1.5 opacity-70 hover:opacity-100"> <X size={12} /> </button> </Badge> ))}
                        </div>
                      </div>
                      <div>
                        <Label>{t('taskList.taskSteps')}</Label>
                        <div className="flex gap-2 mt-1">
                          <Input type="text" value={newStepText} onChange={(e) => setNewStepText(e.target.value)} placeholder={t('taskList.stepTextPlaceholder')} className="flex-grow" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" onClick={handleAddStep} variant="outline" size="sm">{t('taskList.addStep')}</Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('tooltips.addStep')}</p></TooltipContent>
                          </Tooltip>
                        </div>
                        <ScrollArea className="mt-2 max-h-40 pr-1">
                          <div className="space-y-2">
                              {currentSteps.map((step) => (
                              <div key={step.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                                  <Checkbox id={`step-${step.id}`} checked={step.isCompleted} onCheckedChange={() => handleToggleStep(step.id)} />
                                  <Label htmlFor={`step-${step.id}`} className={cn("flex-grow cursor-pointer text-sm", step.isCompleted && "line-through text-muted-foreground")}> {step.text} </Label>
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveStep(step.id)}> <Trash2 size={14} /> </Button>
                              </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </form>
              </div>
              <DialogFooter className="p-6 pt-4 shrink-0 border-t bg-background z-10 sm:justify-between"> 
                  <div className="flex gap-2 flex-wrap">
                      {editingTask && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="destructive" onClick={handleDeleteFromDialog} className="mb-2 sm:mb-0"> <Trash2 className="mr-2 h-4 w-4" /> {t('taskList.deleteTask')} </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{t('tooltips.deleteTaskFromDialog')}</p></TooltipContent>
                        </Tooltip>
                      )}
                      {isAdvancedMode && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" variant="outline" onClick={handleSaveAsRecurringTask} title={t('taskList.saveAsRecurringTask')} className="mb-2 sm:mb-0"> <Save className="mr-2 h-4 w-4"/> {t('taskList.saveAsRecurringTask')} </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('tooltips.saveAsRecurring')}</p></TooltipContent>
                          </Tooltip>
                      )}
                  </div>
                  <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={closeDialog}>{t('taskList.cancel')}</Button>
                      <Button type="button" onClick={handleSubmit} className="transition-transform duration-200 hover:scale-105">{editingTask ? t('taskList.saveChanges') : t('taskList.addTask')}</Button>
                  </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <div className="h-full overflow-y-auto p-4">
            {!hasMounted ? ( <p className="text-muted-foreground text-center py-10">{t('taskList.loadingTasks')}</p> ) : (
              <>
                {pendingTasks.length === 0 && ( <p className="text-muted-foreground text-center py-10">{t('taskList.noTasksYet')}</p> )}
                {pendingTasks.length > 0 && (
                  <>
                    {pendingTasks.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(task => (
                      <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onSetActive={onSetActive} onDelete={onDeleteTask} onEdit={() => handleEditTask(task)} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>

        <Dialog open={isRecurringTaskDialogOpen} onOpenChange={setIsRecurringTaskDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader> <DialogTitle>{t('taskList.manageRecurringTasksTitle')}</DialogTitle> </DialogHeader>
            <div className="py-4">
              {recurringTasks.length === 0 ? ( <p className="text-muted-foreground text-center">{t('taskList.noRecurringTasksFound')}</p> ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">{t('taskList.selectRecurringTaskPrompt')}</p>
                  <ScrollArea className="max-h-60 pr-2">
                    <ul className="space-y-2">
                      {recurringTasks.map(rt => (
                        <li key={rt.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                          <button type="button" className="flex-grow text-left hover:text-primary truncate" onClick={() => handleSelectRecurringTask(rt)} title={rt.title} > {rt.title} </button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80" onClick={() => openDeleteRecurringTaskConfirm(rt)}> <Trash2 size={16} /> </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{t('tooltips.deleteThisList')}</p></TooltipContent> 
                          </Tooltip>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </>
              )}
            </div>
            <DialogFooter> 
              <Button type="button" variant="outline" onClick={() => setIsRecurringTaskDialogOpen(false)}>{t('taskList.cancel')}</Button> 
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!recurringTaskToDelete} onOpenChange={(open) => !open && setRecurringTaskToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>{t('taskList.deleteRecurringTask')}</AlertDialogTitle>
              <AlertDialogDescription> {recurringTaskToDelete && tFunction('taskList', 'confirmDeleteRecurring', recurringTaskToDelete.title)} </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRecurringTaskToDelete(null)}>{t('taskList.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteRecurringTask} className="bg-destructive hover:bg-destructive/90"> {t('settingsDialog.confirm')} </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </TooltipProvider>
  );
};

export default TaskList;
