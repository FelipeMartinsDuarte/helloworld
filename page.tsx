
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PomodoroTimer from '@/components/pomodoro-timer';
import TaskList from '@/components/task-list';
import type { Task, PomodoroSession, PomodoroMode, RecurringTask, SavedList } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import ConfettiFx from '@/components/confetti-fx';
import { useToast } from "@/hooks/use-toast";
import { useLanguage, getTranslationFunction } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Save, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { useTheme } from 'next-themes'; // No longer needed directly here for homepageBgStyle

export default function HomePage() {
  const { language, t, tFunction } = useLanguage();
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow-tasks', []);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage<PomodoroSession[]>('focusflow-sessions', []);
  const [recurringTasks, setRecurringTasks] = useLocalStorage<RecurringTask[]>('focusflow-recurring-tasks', []);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  // const { resolvedTheme } = useTheme(); // No longer needed here

  const taskCompleteAudioRef = useRef<HTMLAudioElement | null>(null);

  const [savedLists, setSavedLists] = useLocalStorage<SavedList[]>('focusflow-saved-lists', []);
  const [currentLoadedListName, setCurrentLoadedListName] = useLocalStorage<string | null>('focusflow-current-list-name', null);

  const [isSaveListDialogOpen, setIsSaveListDialogOpen] = useState(false);
  const [saveListName, setSaveListName] = useState('');

  const [isLoadListDialogOpen, setIsLoadListDialogOpen] = useState(false);
  const [listToLoad, setListToLoad] = useState<SavedList | null>(null);
  const [listToRename, setListToRename] = useState<SavedList | null>(null);
  const [renameListName, setRenameListName] = useState('');
  const [listToDelete, setListToDelete] = useState<SavedList | null>(null);
  // const [homepageBgStyle, setHomepageBgStyle] = useState<React.CSSProperties>({}); // Removed, page will use global --background


  useEffect(() => {
    if (typeof window !== 'undefined') {
      taskCompleteAudioRef.current = new Audio('/sounds/sucess-sound-effect.mp3');
    }
  }, []);

  // useEffect(() => { // Removed as page will rely on global --background from globals.css
  //   const applyHomepageBackground = () => {
  //     // ...
  //   };
  //   // ...
  // }, [resolvedTheme]);


  const playTaskCompleteSound = () => {
    taskCompleteAudioRef.current?.play().catch(error => console.warn("Task complete audio play failed:", error));
  };

  const activeTask = tasks.find(task => task.isActive && !task.isCompleted);

  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'completedTimeInMinutes' | 'isActive' | 'isCompleted' | 'createdAt' | 'completedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completedTimeInMinutes: 0,
      isActive: false,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      steps: taskData.steps ? taskData.steps.map(s => ({...s, isCompleted: false})) : undefined,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setCurrentLoadedListName(null); 
    toast({
      title: t('homePage.taskAdded'),
      description: tFunction('homePage', 'taskAddedDescription', newTask.title)
    });
  }, [setTasks, toast, t, tFunction, setCurrentLoadedListName]);


  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
    setCurrentLoadedListName(null); 
    toast({
      title: t('homePage.taskUpdated'),
      description: tFunction('homePage', 'taskUpdatedDescription', updatedTask.title)
    });
  }, [setTasks, toast, t, tFunction, setCurrentLoadedListName]);

  const handleToggleComplete = useCallback((id: string, forceComplete?: boolean) => {
    let taskTitleForToast: string | null = null;
    let taskJustGotCompleted = false;

    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const isCurrentlyCompleted = task.isCompleted;
          const newCompletedStatus = forceComplete === undefined ? !isCurrentlyCompleted : forceComplete;

          if (newCompletedStatus && !isCurrentlyCompleted) {
            taskTitleForToast = task.title;
            taskJustGotCompleted = true;
            return { ...task, isCompleted: true, completedAt: new Date().toISOString(), isActive: false };
          } else if (!newCompletedStatus && isCurrentlyCompleted) {
            return { ...task, isCompleted: false, completedAt: undefined };
          }
          if (newCompletedStatus) {
             return { ...task, isCompleted: true, completedAt: task.completedAt || new Date().toISOString(), isActive: false };
          }
        }
        return task;
      })
    );
    
    if (taskJustGotCompleted) {
      setCurrentLoadedListName(null); 
    }

    if (taskJustGotCompleted && taskTitleForToast) {
      setShowConfetti(true);
      playTaskCompleteSound();
      toast({
        title: t('homePage.taskComplete'),
        description: tFunction('homePage', 'taskCompleteDescription', taskTitleForToast)
      });
    }
  }, [setTasks, toast, t, tFunction, setCurrentLoadedListName]);


  const handleSetActiveTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => ({
        ...task,
        isActive: task.id === id ? !task.isActive : false,
      }))
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
       const confirmDeleteFn = getTranslationFunction<(taskTitle: string) => string>(language, 'taskList', 'confirmDelete');
       if (window.confirm(confirmDeleteFn(taskToDelete.title || t('taskList.thisTaskFallback') ))) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        setPomodoroSessions(prevSessions => prevSessions.filter(session => session.taskId !== id));
        setCurrentLoadedListName(null); 
        toast({
            title: t('homePage.taskDeleted'),
            description: tFunction('homePage', 'taskDeletedDescription', taskToDelete.title || t('taskList.theTaskFallback')),
            variant: "destructive"
        });
      }
    }
  };

  const handleActualWorkTimeUpdate = useCallback((elapsedMinutes: number) => {
    if (activeTask && elapsedMinutes > 0) {
      let taskJustCompletedByThisUpdate = false;
      let completedTaskTitleForToast : string | null = null;

      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === activeTask.id && !task.isCompleted) {
            const newCompletedTime = task.completedTimeInMinutes + elapsedMinutes;
            const estimatedTimeInMinutes = task.estimatedTimeUnit === 'hours'
              ? task.estimatedTime * 60
              : task.estimatedTime;

            if (newCompletedTime >= estimatedTimeInMinutes && !task.isCompleted) {
              taskJustCompletedByThisUpdate = true;
              completedTaskTitleForToast = task.title;
            }
            return { ...task, completedTimeInMinutes: newCompletedTime };
          }
          return task;
        })
      );
      
      if (elapsedMinutes > 0) {
         setCurrentLoadedListName(null); 
      }

      if (taskJustCompletedByThisUpdate && activeTask && completedTaskTitleForToast) {
        setTimeout(() => handleToggleComplete(activeTask.id, true), 0);
      }
    }
  }, [activeTask, setTasks, handleToggleComplete, setCurrentLoadedListName]);

  const handlePomodoroSessionComplete = useCallback((mode: PomodoroMode, configuredDurationInMinutes: number) => {
    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      type: mode,
      durationMinutes: configuredDurationInMinutes,
      completedAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };

    if ((mode === 'work') && activeTask) {
      newSession.taskId = activeTask.id;
    }
    setPomodoroSessions(prevSessions => [...prevSessions, newSession]);
  }, [activeTask, setPomodoroSessions]);

  const handleSaveCurrentList = () => {
    if (!saveListName.trim()) {
      toast({ title: t('taskList.listNamePlaceholder'), variant: 'destructive'});
      return;
    }
    if (savedLists.some(list => list.name.toLowerCase() === saveListName.trim().toLowerCase())) {
      toast({ title: tFunction('taskList', 'listNameExistsError', saveListName.trim()), variant: 'destructive'});
      return;
    }

    const newListToSave: SavedList = {
      id: crypto.randomUUID(),
      name: saveListName.trim(),
      tasks: JSON.parse(JSON.stringify(tasks)), 
    };
    setSavedLists(prev => [...prev, newListToSave]);
    setCurrentLoadedListName(newListToSave.name);
    toast({ title: tFunction('taskList', 'listSavedSuccess', newListToSave.name) });
    setIsSaveListDialogOpen(false);
    setSaveListName('');
  };

  const handleConfirmLoadList = () => {
    if (!listToLoad) return;
    const currentTaskIds = new Set(tasks.map(t => t.id));
    const newTaskIds = new Set(listToLoad.tasks.map(t => t.id));
    const idsToRemoveSessionsFor = Array.from(currentTaskIds).filter(id => !newTaskIds.has(id));
    setPomodoroSessions(prevSessions => 
      prevSessions.filter(session => !session.taskId || !idsToRemoveSessionsFor.includes(session.taskId))
    );
    setTasks(JSON.parse(JSON.stringify(listToLoad.tasks))); 
    setCurrentLoadedListName(listToLoad.name);
    toast({ title: tFunction('taskList', 'listLoadedSuccess', listToLoad.name) });
    setListToLoad(null);
    setIsLoadListDialogOpen(false);
  };

  const handleInitiateRenameList = (list: SavedList) => {
    setListToRename(list);
    setRenameListName(list.name);
  };

  const handleConfirmRenameList = () => {
    if (!listToRename || !renameListName.trim()) return;
    if (renameListName.trim().toLowerCase() !== listToRename.name.toLowerCase() && 
        savedLists.some(list => list.name.toLowerCase() === renameListName.trim().toLowerCase())) {
      toast({ title: tFunction('taskList', 'listNameExistsError', renameListName.trim()), variant: 'destructive' });
      return;
    }
    const oldName = listToRename.name;
    setSavedLists(prev => 
      prev.map(list => 
        list.id === listToRename.id ? { ...list, name: renameListName.trim() } : list
      )
    );
    if (currentLoadedListName === oldName) {
      setCurrentLoadedListName(renameListName.trim());
    }
    toast({ title: tFunction('taskList', 'listRenamedSuccess', oldName, renameListName.trim()) });
    setListToRename(null);
    setRenameListName('');
  };

  const handleInitiateDeleteList = (list: SavedList) => {
    setListToDelete(list);
  };

  const handleConfirmDeleteList = () => {
    if (!listToDelete) return;
    setSavedLists(prev => prev.filter(list => list.id !== listToDelete.id));
    if (currentLoadedListName === listToDelete.name) {
      setCurrentLoadedListName(null);
    }
    toast({ title: tFunction('taskList', 'listDeletedSuccess', listToDelete.name), variant: "destructive" });
    setListToDelete(null);
  };


  return (
    <TooltipProvider>
      <div className="flex-grow"> {/* Removed inline style, relies on global --background */}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-full">
          <div className="flex flex-col lg:flex-row gap-8 h-full">
            <div className="lg:w-3/5 flex justify-center items-start"> 
              <PomodoroTimer
                onSessionComplete={handlePomodoroSessionComplete}
                onActualWorkTimeUpdate={handleActualWorkTimeUpdate}
                activeTaskDetails={activeTask || null}
              />
            </div>
            <div className="lg:w-2/5 h-full flex flex-col"> 
              <div className="flex justify-between items-center mb-2 px-1">
                {currentLoadedListName ? (
                  <p className="text-xs text-muted-foreground">
                    {t('taskList.loadedListPrefix')} {currentLoadedListName}
                  </p>
                ) : <div />} 
                <div className="flex gap-2">
                  <Dialog open={isSaveListDialogOpen} onOpenChange={setIsSaveListDialogOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" title={t('taskList.saveList')}> <Save className="h-4 w-4" /> </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltips.saveCurrentList')}</p></TooltipContent>
                    </Tooltip>
                    <DialogContent>
                      <DialogHeader> <DialogTitle>{t('taskList.saveCurrentListTitle')}</DialogTitle> </DialogHeader>
                      <Input value={saveListName} onChange={(e) => setSaveListName(e.target.value)} placeholder={t('taskList.listNamePlaceholder')} className="my-4" />
                      <DialogFooter> <Button variant="outline" onClick={() => setIsSaveListDialogOpen(false)}>{t('taskList.cancel')}</Button> <Button onClick={handleSaveCurrentList}>{t('taskList.save')}</Button> </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isLoadListDialogOpen} onOpenChange={setIsLoadListDialogOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" title={t('taskList.loadList')}> <FolderOpen className="h-4 w-4" /> </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('tooltips.loadSavedList')}</p></TooltipContent>
                    </Tooltip>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader> <DialogTitle>{t('taskList.loadExistingListTitle')}</DialogTitle> </DialogHeader>
                      {savedLists.length === 0 ? ( <p className="text-muted-foreground py-4 text-center">{t('taskList.noSavedLists')}</p> ) : (
                        <ScrollArea className="max-h-72 my-4">
                          <ul className="space-y-2 pr-3">
                            {savedLists.map(list => (
                              <li key={list.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/20">
                                <span className="truncate flex-grow mr-2" title={list.name}>{list.name}</span>
                                <div className="flex gap-1 shrink-0">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setListToLoad(list)}> <FolderOpen size={16} /> </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{t('tooltips.loadThisList')}</p></TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleInitiateRenameList(list)}> <Edit2 size={16} /> </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{t('tooltips.renameThisList')}</p></TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleInitiateDeleteList(list)}> <Trash2 size={16} /> </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{t('tooltips.deleteThisList')}</p></TooltipContent>
                                  </Tooltip>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                      )}
                       <DialogFooter> <Button variant="outline" onClick={() => setIsLoadListDialogOpen(false)}>{t('taskList.cancel')}</Button> </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex-grow overflow-hidden"> 
                <TaskList tasks={tasks.filter(task => !task.isCompleted)} recurringTasks={recurringTasks} setRecurringTasks={setRecurringTasks} onAddTask={handleAddTask} onToggleComplete={handleToggleComplete} onSetActive={handleSetActiveTask} onDeleteTask={handleDeleteTask} onUpdateTask={handleUpdateTask} />
              </div>
            </div>
          </div>
        </div>
        <ConfettiFx trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

        <AlertDialog open={!!listToLoad} onOpenChange={(open) => !open && setListToLoad(null)}>
          <AlertDialogContent>
            <AlertDialogHeader> <AlertDialogTitle>{t('taskList.confirmLoadListTitle')}</AlertDialogTitle> <AlertDialogDescription>{t('taskList.confirmLoadListMessage')}</AlertDialogDescription> </AlertDialogHeader>
            <AlertDialogFooter> <AlertDialogCancel onClick={() => setListToLoad(null)}>{t('taskList.cancel')}</AlertDialogCancel> <AlertDialogAction onClick={handleConfirmLoadList}>{t('taskList.load')}</AlertDialogAction> </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!listToRename} onOpenChange={(open) => { if(!open) {setListToRename(null); setRenameListName('');}}}>
          <DialogContent>
            <DialogHeader> <DialogTitle>{t('taskList.renameListTitle')}: {listToRename?.name}</DialogTitle> </DialogHeader>
            <Input value={renameListName} onChange={(e) => setRenameListName(e.target.value)} placeholder={t('taskList.newListnamePlaceholder')} className="my-4" />
            <DialogFooter> <Button variant="outline" onClick={() => {setListToRename(null); setRenameListName('');}}>{t('taskList.cancel')}</Button> <Button onClick={handleConfirmRenameList}>{t('taskList.rename')}</Button> </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!listToDelete} onOpenChange={(open) => !open && setListToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader> <AlertDialogTitle>{t('taskList.confirmDeleteListTitle')}</AlertDialogTitle> <AlertDialogDescription> {listToDelete && tFunction('taskList', 'confirmDeleteListMessage', listToDelete.name)} </AlertDialogDescription> </AlertDialogHeader>
            <AlertDialogFooter> <AlertDialogCancel onClick={() => setListToDelete(null)}>{t('taskList.cancel')}</AlertDialogCancel> <AlertDialogAction onClick={handleConfirmDeleteList} className="bg-destructive hover:bg-destructive/80"> {t('taskList.delete')} </AlertDialogAction> </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

// Add useTheme import
// import { useTheme } from 'next-themes'; // No longer needed for homepageBgStyle here
