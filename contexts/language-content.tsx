
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export type Language = 'en' | 'pt-BR';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  t: (key: string, section?: string) => string;
  tFunction: (section: string, key: string, ...args: any[]) => string;
}

const translations: Record<Language, Record<string, any>> = {
  'en': {
    appHeader: {
      dashboard: "Dashboard",
      toggleTheme: "Toggle theme",
      toggleLanguage: "Change language",
      settings: "Settings",
      motivationalMessage: {
        title: "Daily Motivational Message",
      }
    },
    settingsDialog: {
      title: "Settings",
      notificationsTab: "Notifications",
      generalTab: "General",
      appearanceTab: "Appearance",
      saveThemeSettings: "Save Theme",
      resetThemeSettings: "Reset Theme to Defaults",
      confirmResetThemeTitle: "Confirm Reset Theme",
      confirmResetThemeMessage: (mode: string) => `Are you sure you want to reset the theme to default for ${mode} mode? Your custom theme choice will be lost.`,
      themeSettingsSaved: "Theme settings saved!",
      themeSettingsReset: "Theme reset to default.",
      selectThemePrompt: "Select a theme:",
      themeDefault: "FocusFlow Default",
      themeOceanBreeze: "Ocean Breeze",
      themeSunsetGlow: "Sunset Glow",
      themeForestCanopy: "Forest Canopy",
      themeModernMinimalist: "Modern Minimalist",
      themeVibrantPop: "Vibrant Pop",
      themeCrimsonFire: "Crimson Fire",
      mainColor: "Main Color",
      homepageBackgroundColor: "Homepage Background Color",
      todolistBackgroundColor: "To-Do List Background Color",
      contrastColorNote: "Contrast color for timer text is set automatically based on Main Color.",
      useMainColorForContrast: "Use Main Color for Contrast Color",
      telegramSectionTitle: "Telegram Notifications",
      enableTelegramNotifications: "Enable Telegram Notifications",
      telegramBotTokenLabel: "Telegram Bot Token",
      telegramBotTokenPlaceholder: "Enter your Bot Token",
      telegramChatIdLabel: "Telegram Chat ID",
      telegramChatIdPlaceholder: "Enter your Chat ID",
      unlinkTelegram: "Unlink Telegram",
      saveTelegramSettings: "Save Settings",
      telegramSettingsUpdated: "Telegram settings updated.",
      generalSectionTitle: "Application Data",
      clearAllDataButton: "Clear All Application Data",
      clearAllDataDescription: "This will remove all tasks, sessions, recurring tasks, global tags, saved lists, and custom settings (including theme choice) from your browser's local storage. This action cannot be undone.",
      clearAllDataConfirmationTitle: "Confirm Clear Data",
      clearAllDataConfirmationMessage: "Are you sure you want to clear all application data (tasks, sessions, recurring tasks, global tags, saved lists, settings, theme choice)? This action cannot be undone.",
      clearAllDataSuccessToastTitle: "Data Cleared",
      clearAllDataSuccessToastDescription: "Application data has been reset. The page will now reload.",
      cancel: "Cancel",
      confirm: "Confirm",
      motivationalMessageSectionTitle: "Motivational Message",
      showMotivationalMessage: "Show daily motivational message on load",
      showMotivationalMessageDescription: "Displays an inspiring quote once per session when the app loads.",
    },
    pomodoroTimer: {
      workSession: "Work Session",
      shortBreakSession: "Short Break",
      longBreakSession: "Long Break",
      focusOnTaskTitle: (taskTitle: string) => `Focus: ${taskTitle}`,
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      skip: "Skip",
      settings: "Timer Settings",
      timerSettingsTitle: "Timer Durations",
      timerSettingsUpdated: "Timer durations have been updated.",
      activeTaskPrefix: "Active:",
      noActiveTaskError: "No Active Task",
      noActiveTaskDescription: "Please select or create an active task to start a work session.",
      sessionEnded: "Session Ended!",
      taskTimeUpTitle: "Task Time Up!",
      taskTimeUpDescription: (taskTitle: string) => `The allocated time for "${taskTitle}" has finished.`,
      timeForShortBreak: "Time for a short break!",
      timeForLongBreak: "Time for a long break!",
      timeToFocus: "Time to focus!",
      settingsSaved: "Settings Saved!",
      confirmSkip: (sessionType: string) => `Are you sure you want to skip this ${sessionType}?`,
      workDurationLabel: "Work (minutes)",
      shortBreakDurationLabel: "Short Break (minutes)",
      longBreakDurationLabel: "Long Break (minutes)",
      longBreakIntervalLabel: "Long Break After (pomodoros)",
      saveSettings: "Save Settings",
      enablePomodoroMode: "Enable Pomodoro Mode",
      pomodoroModeEnabledDesc: "Timer will follow Work/Break cycles.",
      pomodoroModeDisabledDesc: "Timer duration will be based on the active task's remaining time.",
      telegramConfirmationSent: "Telegram Connected!",
      telegramConfirmationSentDesc: "A confirmation message has been sent to your Telegram.",
      telegramConfirmationFailed: "Telegram Connection Failed",
      telegramConfirmationFailedDesc: "Could not send confirmation. Please check your token and chat ID.",
      telegramNotificationFailed: "Telegram Notification Failed",
      telegramNotificationFailedDesc: "Could not send Telegram notification. Check settings.",
      telegramBreakOverMessage: "Hey there! 👋 Your break on FocusFlow is over. Time to get back to it! 🚀",
      telegramWelcomeMessage: "Hey! 👋 FocusFlow here, all set to ping you when breaks end. Let's boost that productivity! ✨",
      telegramUnlinked: "Telegram Unlinked",
      telegramUnlinkedDesc: "Telegram notifications have been disabled and your details cleared.",
    },
    taskList: {
      toDoList: "To-Do List",
      addTask: "Add Task",
      editTask: "Edit Task",
      addNewTask: "Add New Task",
      taskTitleLabel: "Task Title",
      taskTitlePlaceholder: "e.g., Design new feature",
      estimatedTimeLabel: "Estimated Time",
      unitLabel: "Unit",
      minutes: "Minutes",
      hours: "Hours",
      saveChanges: "Save Changes",
      deleteTask: "Delete Task",
      thisTaskFallback: "this task",
      theTaskFallback: "The task",
      confirmDelete: (taskTitle: string) => `Are you sure you want to delete task: "${taskTitle}"?`,
      loadingTasks: "Loading tasks...",
      noTasksYet: "No tasks yet. Add one to get started!",
      errorTimeLimitTitle: "Task Too Long",
      errorTimeLimitDescription: "Task duration cannot exceed 9999 hours. Please divide the task.",
      switchToAdvancedCreation: "Switch to Advanced Creation",
      description: "Description",
      descriptionPlaceholder: "Add more details about the task...",
      tags: "Tags",
      addTag: "Add Tag",
      tagNamePlaceholder: "Tag name (max 30 chars)",
      tagColor: "Color",
      taskSteps: "Task Steps / Subtasks",
      addStep: "Add Step",
      stepTextPlaceholder: "Describe this step...",
      saveAsRecurringTask: "Save as Recurring Task",
      useRecurringTaskTooltip: "Use a recurring task template",
      recurringTaskSaved: "Recurring Task Saved!",
      recurringTaskSavedDescription: (title: string) => `"${title}" is now saved as a recurring task.`,
      manageRecurringTasksTitle: "Manage Recurring Tasks",
      selectRecurringTaskPrompt: "Select a template to pre-fill the form:",
      noRecurringTasksFound: "No recurring tasks found. Save some first!",
      deleteRecurringTask: "Delete Recurring Task",
      confirmDeleteRecurring: (title: string) => `Are you sure you want to delete the recurring task template: "${title}"?`,
      recurringTaskDeleted: "Recurring Task Deleted",
      recurringTaskDeletedDescription: (title: string) => `The template "${title}" has been removed.`,
      suggestedTags: "Suggested tags:",
      moreTags: (params: { count: number }) => `+${params.count} more`,
      saveList: "Save List",
      loadList: "Load List",
      saveCurrentListTitle: "Save Current List",
      listNamePlaceholder: "Enter list name (e.g., Morning Routine)",
      save: "Save",
      loadExistingListTitle: "Load Existing List",
      noSavedLists: "No saved lists yet.",
      load: "Load",
      rename: "Rename",
      delete: "Delete",
      confirmLoadListTitle: "Confirm Load List",
      confirmLoadListMessage: "Loading this list will overwrite your current tasks. Do you want to continue?",
      listLoadedSuccess: (name: string) => `List "${name}" loaded successfully.`,
      listSavedSuccess: (name: string) => `List "${name}" saved successfully.`,
      listNameExistsError: (name: string) => `A list named "${name}" already exists. Please choose a different name.`,
      renameListTitle: "Rename List",
      newListnamePlaceholder: "Enter new list name",
      listRenamedSuccess: (oldName: string, newName: string) => `List "${oldName}" renamed to "${newName}".`,
      confirmDeleteListTitle: "Confirm Delete List",
      confirmDeleteListMessage: (name: string) => `Are you sure you want to delete the saved list "${name}"? This action cannot be undone.`,
      listDeletedSuccess: (name: string) => `List "${name}" deleted successfully.`,
      cancel: "Cancel",
      loadedListPrefix: "Loaded list:",
    },
    taskItem: {
      markIncomplete: "Mark as incomplete",
      markComplete: "Mark as complete",
      active: "Active",
      activateButton: "Set as active task",
      deactivateButton: "Deactivate task",
      editButton: "Edit task",
      deleteButton: "Delete task",
      estimatedTime: "Estimated time:",
      timeSpent: "Time spent:",
      description: "Description:",
      tags: "Tags:",
      allTags: "All Tags:",
      steps: "Steps:",
      stepCompleted: (completed: number, total: number) => `${completed}/${total} completed`,
      showDetails: "Show details",
      hideDetails: "Hide details",
      activeBadge: "Active",
    },
    homePage: {
      taskAdded: "Task Added!",
      taskAddedDescription: (title: string) => `"${title}" has been added to your list.`,
      taskUpdated: "Task Updated!",
      taskUpdatedDescription: (title: string) => `"${title}" has been updated.`,
      taskComplete: "Task Complete!",
      taskCompleteDescription: (title: string) => `Great job on finishing "${title}"!`,
      taskDeleted: "Task Deleted",
      taskDeletedDescription: (title: string) => `"${title}" removed.`,
    },
    dashboardPage: {
      dashboard: "Dashboard",
      backToTimer: "Back to Timer",
      taskRestored: "Task Restored!",
      taskRestoredDescription: (title: string) => `"${title}" has been moved back to your To-Do list.`,
      taskDeleted: "Task Permanently Deleted",
      taskDeletedDescription: (title: string) => `"${title}" and its associated sessions have been removed.`,
      confirmPermanentDelete: (title: string) => `Are you sure you want to PERMANENTLY delete task: "${title}"? This will also delete its associated Pomodoro sessions.`,
    },
    completedTasksList: {
      completedTasks: "Completed Tasks",
      noTasksCompleted: "No tasks completed yet.",
      completed: "Completed",
      restore: "Restore",
      delete: "Delete Permanently",
      estTimeLabel: "Est:",
      spentTimeLabel: "Spent:",
      minutesOfProductivity: (minutes: number) => `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} of productivity`,
      minutesOfDelay: (minutes: number) => `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} of delay`,
    },
    statsCards: {
      totalPomodoros: "Total Pomodoros",
      tasksCompleted: "Tasks Completed",
      totalWorkTime: "Total Work Time",
      totalBreakTime: "Total Break Time",
      sessionsUnit: "sessions",
      tasksUnit: "tasks",
      minutesUnit: "minutes (approx)",
    },
    charts: {
      timeAllocation: "Time Allocation",
      taskCompletionTrend: "Task Completion Trend (Last 7 Days)",
      pomodorosCompleted: "Pomodoros Completed (Last 7 Days)",
      work: "Work",
      shortBreak: "Short Break",
      longBreak: "Long Break",
      tasksCompleted: "Tasks Completed",
      pomodoros: "Pomodoros",
      noSessionData: "No session data to display time allocation.",
    },
    themeToggle: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    motivationalMessage: {
      closeAltText: "Close motivational message",
      fetchErrorTitle: "Quote Unavailable",
      fetchErrorMessage: "Could not fetch a motivational quote at this time. Please check your connection or try again later.",
      translationError: "Could not translate quote at this time.",
      dismissButton: "Dismiss",
      loadingQuote: "Loading an inspiring thought...",
    },
    tooltips: {
      // AppHeader
      dashboard: "View Dashboard",
      changeLanguage: "Change Language",
      appSettings: "Application Settings",
      toggleTheme: "Toggle Theme",
      // PomodoroTimer
      resetTimer: "Reset Timer",
      startTimer: "Start Timer",
      pauseTimer: "Pause Timer",
      skipSession: "Skip Current Session",
      timerSettings: "Timer Settings",
      // TaskList - Main
      addTask: "Add a new task",
      // TaskList - Dialog
      useRecurringTask: "Use a recurring task template",
      addTag: "Add this tag to the task",
      pickTagColor: "Pick a color for the new tag",
      addStep: "Add a new step to the task",
      saveAsRecurring: "Save current task details as a new recurring template",
      deleteTaskFromDialog: "Delete this task permanently",
      // TaskList - List Management
      saveCurrentList: "Save current task list",
      loadSavedList: "Load a previously saved task list",
      // TaskList - Load List Dialog
      loadThisList: "Load this list",
      renameThisList: "Rename this list",
      deleteThisList: "Delete this saved list",
      // TaskItem
      markTaskComplete: "Mark task as complete",
      markTaskIncomplete: "Mark task as incomplete",
      activateTask: "Set as active task for timer",
      deactivateTask: "Deactivate this task",
      editTask: "Edit task details",
      deleteTask: "Delete this task",
      activeTaskBadge: "This task is currently active for the timer",
      showTaskDetails: "Show task details",
      hideTaskDetails: "Hide task details",
      // CompletedTasksList (Dashboard)
      restoreTask: "Restore this task to the To-Do list",
      deleteTaskPermanently: "Delete this task permanently (cannot be undone)",
    }
  },
  'pt-BR': {
    appHeader: {
      dashboard: "Painel",
      toggleTheme: "Alternar tema",
      toggleLanguage: "Mudar idioma",
      settings: "Configurações",
      motivationalMessage: {
        title: "Mensagem Motivacional Diária",
      }
    },
    settingsDialog: {
      title: "Configurações",
      notificationsTab: "Notificações",
      generalTab: "Geral",
      appearanceTab: "Aparência",
      saveThemeSettings: "Salvar Tema",
      resetThemeSettings: "Restaurar Tema Padrão",
      confirmResetThemeTitle: "Confirmar Restauração do Tema",
      confirmResetThemeMessage: (mode: string) => `Tem certeza que deseja restaurar o tema para o padrão do modo ${mode}? Sua escolha de tema personalizado será perdida.`,
      themeSettingsSaved: "Configurações de tema salvas!",
      themeSettingsReset: "Tema restaurado para o padrão.",
      selectThemePrompt: "Selecione um tema:",
      themeDefault: "Padrão FocusFlow",
      themeOceanBreeze: "Brisa do Mar",
      themeSunsetGlow: "Brilho do Pôr do Sol",
      themeForestCanopy: "Copa da Floresta",
      themeModernMinimalist: "Moderno Minimalista",
      themeVibrantPop: "Pop Vibrante",
      themeCrimsonFire: "Fogo Carmesim",
      mainColor: "Cor Principal",
      homepageBackgroundColor: "Cor de Fundo da Página Inicial",
      todolistBackgroundColor: "Cor de Fundo da Lista de Tarefas",
      contrastColorNote: "A cor de contraste para o texto do timer é definida automaticamente com base na Cor Principal.",
      useMainColorForContrast: "Usar Cor Principal para Cor de Contraste",
      telegramSectionTitle: "Notificações do Telegram",
      enableTelegramNotifications: "Ativar Notificações do Telegram",
      telegramBotTokenLabel: "Token do Bot Telegram",
      telegramBotTokenPlaceholder: "Insira seu Token do Bot",
      telegramChatIdLabel: "Chat ID do Telegram",
      telegramChatIdPlaceholder: "Insira seu Chat ID",
      unlinkTelegram: "Desvincular Telegram",
      saveTelegramSettings: "Salvar Configurações",
      telegramSettingsUpdated: "Configurações do Telegram atualizadas.",
      generalSectionTitle: "Dados da Aplicação",
      clearAllDataButton: "Limpar Todos os Dados da Aplicação",
      clearAllDataDescription: "Isso removerá todas as tarefas, sessões, tarefas recorrentes, etiquetas globais, listas salvas e configurações personalizadas (incluindo escolha de tema) do armazenamento local do seu navegador. Esta ação não pode ser desfeita.",
      clearAllDataConfirmationTitle: "Confirmar Limpeza de Dados",
      clearAllDataConfirmationMessage: "Tem certeza que deseja limpar todos os dados da aplicação (tarefas, sessões, tarefas recorrentes, etiquetas globais, listas salvas, configurações, escolha de tema)? Esta ação não pode ser desfeita.",
      clearAllDataSuccessToastTitle: "Dados Limpos",
      clearAllDataSuccessToastDescription: "Os dados da aplicação foram redefinidos. A página será recarregada agora.",
      cancel: "Cancelar",
      confirm: "Confirmar",
      motivationalMessageSectionTitle: "Mensagem Motivacional",
      showMotivationalMessage: "Mostrar mensagem motivacional diária ao carregar",
      showMotivationalMessageDescription: "Exibe uma citação inspiradora uma vez por sessão quando o aplicativo carrega.",
    },
    pomodoroTimer: {
      workSession: "Sessão de Foco",
      shortBreakSession: "Pausa Curta",
      longBreakSession: "Pausa Longa",
      focusOnTaskTitle: (taskTitle: string) => `Foco: ${taskTitle}`,
      start: "Iniciar",
      pause: "Pausar",
      reset: "Resetar",
      skip: "Pular",
      settings: "Config. do Timer",
      timerSettingsTitle: "Durações do Timer",
      timerSettingsUpdated: "As durações do timer foram atualizadas.",
      activeTaskPrefix: "Ativa:",
      noActiveTaskError: "Nenhuma Tarefa Ativa",
      noActiveTaskDescription: "Por favor, selecione ou crie uma tarefa ativa para iniciar uma sessão de foco.",
      sessionEnded: "Sessão Encerrada!",
      taskTimeUpTitle: "Tempo da Tarefa Esgotado!",
      taskTimeUpDescription: (taskTitle: string) => `O tempo alocado para "${taskTitle}" terminou.`,
      timeForShortBreak: "Hora de uma pausa curta!",
      timeForLongBreak: "Hora de uma pausa longa!",
      timeToFocus: "Hora de focar!",
      settingsSaved: "Configurações Salvas!",
      confirmSkip: (sessionType: string) => `Tem certeza que deseja pular esta ${sessionType.toLowerCase()}?`,
      workDurationLabel: "Foco (minutos)",
      shortBreakDurationLabel: "Pausa Curta (minutos)",
      longBreakDurationLabel: "Pausa Longa (minutos)",
      longBreakIntervalLabel: "Pausa Longa Após (pomodoros)",
      saveSettings: "Salvar Configurações",
      enablePomodoroMode: "Ativar Modo Pomodoro",
      pomodoroModeEnabledDesc: "O timer seguirá os ciclos de Foco/Pausa.",
      pomodoroModeDisabledDesc: "A duração do timer será baseada no tempo restante da tarefa ativa.",
      telegramConfirmationSent: "Telegram Conectado!",
      telegramConfirmationSentDesc: "Uma mensagem de confirmação foi enviada para o seu Telegram.",
      telegramConfirmationFailed: "Falha na Conexão com Telegram",
      telegramConfirmationFailedDesc: "Não foi possível enviar a confirmação. Verifique seu token e Chat ID.",
      telegramNotificationFailed: "Falha na Notificação do Telegram",
      telegramNotificationFailedDesc: "Não foi possível enviar notificação. Verifique as configurações.",
      telegramBreakOverMessage: "E aí! 👋 Sua pausa no FocusFlow terminou. Hora de voltar ao trabalho! 🚀",
      telegramWelcomeMessage: "Opa! 👋 Aqui é o FocusFlow, tudo pronto para te avisar quando as pausas acabarem. Vamos nessa aumentar a produtividade! ✨",
      telegramUnlinked: "Telegram Desvinculado",
      telegramUnlinkedDesc: "As notificações do Telegram foram desativadas e seus dados removidos.",
    },
    taskList: {
      toDoList: "Lista de Tarefas",
      addTask: "Adicionar Tarefa",
      editTask: "Editar Tarefa",
      addNewTask: "Adicionar Nova Tarefa",
      taskTitleLabel: "Título da Tarefa",
      taskTitlePlaceholder: "Ex: Projetar nova funcionalidade",
      estimatedTimeLabel: "Tempo Estimado",
      unitLabel: "Unidade",
      minutes: "Minutos",
      hours: "Horas",
      saveChanges: "Salvar Alterações",
      deleteTask: "Excluir Tarefa",
      thisTaskFallback: "esta tarefa",
      theTaskFallback: "A tarefa",
      confirmDelete: (taskTitle: string) => `Tem certeza que deseja excluir a tarefa: "${taskTitle}"?`,
      loadingTasks: "Carregando tarefas...",
      noTasksYet: "Nenhuma tarefa ainda. Adicione uma para começar!",
      errorTimeLimitTitle: "Tarefa Muito Longa",
      errorTimeLimitDescription: "A duração da tarefa não pode exceder 9999 horas. Por favor, divida a tarefa.",
      switchToAdvancedCreation: "Mudar para Criação Avançada",
      description: "Descrição",
      descriptionPlaceholder: "Adicione mais detalhes sobre a tarefa...",
      tags: "Etiquetas",
      addTag: "Adicionar Etiqueta",
      tagNamePlaceholder: "Nome da etiqueta (máx 30 chars)",
      tagColor: "Cor",
      taskSteps: "Etapas da Tarefa / Subtarefas",
      addStep: "Adicionar Etapa",
      stepTextPlaceholder: "Descreva esta etapa...",
      saveAsRecurringTask: "Salvar como Tarefa Recorrente",
      useRecurringTaskTooltip: "Usar um modelo de tarefa recorrente",
      recurringTaskSaved: "Tarefa Recorrente Salva!",
      recurringTaskSavedDescription: (title: string) => `"${title}" agora está salva como uma tarefa recorrente.`,
      manageRecurringTasksTitle: "Gerenciar Tarefas Recorrentes",
      selectRecurringTaskPrompt: "Selecione um modelo para preencher o formulário:",
      noRecurringTasksFound: "Nenhuma tarefa recorrente encontrada. Salve algumas primeiro!",
      deleteRecurringTask: "Excluir Tarefa Recorrente",
      confirmDeleteRecurring: (title: string) => `Tem certeza que deseja excluir o modelo de tarefa recorrente: "${title}"?`,
      recurringTaskDeleted: "Tarefa Recorrente Excluída",
      recurringTaskDeletedDescription: (title: string) => `O modelo "${title}" foi removido.`,
      suggestedTags: "Etiquetas sugeridas:",
      moreTags: (params: { count: number }) => `+${params.count} mais`,
      saveList: "Salvar Lista",
      loadList: "Carregar Lista",
      saveCurrentListTitle: "Salvar Lista Atual",
      listNamePlaceholder: "Nome da lista (Ex: Rotina Matinal)",
      save: "Salvar",
      loadExistingListTitle: "Carregar Lista Existente",
      noSavedLists: "Nenhuma lista salva ainda.",
      load: "Carregar",
      rename: "Renomear",
      delete: "Excluir",
      confirmLoadListTitle: "Confirmar Carregamento de Lista",
      confirmLoadListMessage: "Carregar esta lista substituirá suas tarefas atuais. Deseja continuar?",
      listLoadedSuccess: (name: string) => `Lista "${name}" carregada com sucesso.`,
      listSavedSuccess: (name: string) => `Lista "${name}" salva com sucesso.`,
      listNameExistsError: (name: string) => `Uma lista chamada "${name}" já existe. Escolha um nome diferente.`,
      renameListTitle: "Renomear Lista",
      newListnamePlaceholder: "Digite o novo nome da lista",
      listRenamedSuccess: (oldName: string, newName: string) => `Lista "${oldName}" renomeada para "${newName}".`,
      confirmDeleteListTitle: "Confirmar Exclusão de Lista",
      confirmDeleteListMessage: (name: string) => `Tem certeza que deseja excluir a lista salva "${name}"? Esta ação não pode ser desfeita.`,
      listDeletedSuccess: (name: string) => `Lista "${name}" excluída com sucesso.`,
      cancel: "Cancelar",
      loadedListPrefix: "Lista carregada:",
    },
    taskItem: {
      markIncomplete: "Marcar como pendente",
      markComplete: "Marcar como concluída",
      active: "Ativa",
      activateButton: "Definir como tarefa ativa",
      deactivateButton: "Desativar tarefa",
      editButton: "Editar tarefa",
      deleteButton: "Excluir tarefa",
      estimatedTime: "Tempo estimado:",
      timeSpent: "Tempo dedicado:",
      description: "Descrição:",
      tags: "Etiquetas:",
      allTags: "Todas as Etiquetas:",
      steps: "Etapas:",
      stepCompleted: (completed: number, total: number) => `${completed}/${total} concluídas`,
      showDetails: "Mostrar detalhes",
      hideDetails: "Ocultar detalhes",
      activeBadge: "Ativa",
    },
    homePage: {
      taskAdded: "Tarefa Adicionada!",
      taskAddedDescription: (title: string) => `"${title}" foi adicionada à sua lista.`,
      taskUpdated: "Tarefa Atualizada!",
      taskUpdatedDescription: (title: string) => `"${title}" foi atualizada.`,
      taskComplete: "Tarefa Concluída!",
      taskCompleteDescription: (title: string) => `Parabéns por finalizar "${title}"!`,
      taskDeleted: "Tarefa Excluída",
      taskDeletedDescription: (title: string) => `"${title}" removida.`,
    },
    dashboardPage: {
      dashboard: "Painel",
      backToTimer: "Voltar ao Timer",
      taskRestored: "Tarefa Restaurada!",
      taskRestoredDescription: (title: string) => `"${title}" foi movida de volta para sua lista de Tarefas.`,
      taskDeleted: "Tarefa Excluída Permanentemente",
      taskDeletedDescription: (title: string) => `"${title}" e suas sessões Pomodoro associadas foram removidas.`,
      confirmPermanentDelete: (title: string) => `Tem certeza que deseja excluir PERMANENTEMENTE a tarefa: "${title}"? Isso também excluirá suas sessões Pomodoro associadas.`,
    },
    completedTasksList: {
      completedTasks: "Tarefas Concluídas",
      noTasksCompleted: "Nenhuma tarefa concluída ainda.",
      completed: "Concluída",
      restore: "Restaurar",
      delete: "Excluir Permanentemente",
      estTimeLabel: "Est:",
      spentTimeLabel: "Dedicado:",
      minutesOfProductivity: (minutes: number) => `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} de produtividade`,
      minutesOfDelay: (minutes: number) => `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} de atraso`,
    },
    statsCards: {
      totalPomodoros: "Total de Pomodoros",
      tasksCompleted: "Tarefas Concluídas",
      totalWorkTime: "Tempo Total de Foco",
      totalBreakTime: "Tempo Total de Pausa",
      sessionsUnit: "sessões",
      tasksUnit: "tarefas",
      minutesUnit: "minutos (aprox.)",
    },
    charts: {
      timeAllocation: "Distribuição do Tempo",
      taskCompletionTrend: "Tendência de Conclusão de Tarefas (Últimos 7 Dias)",
      pomodorosCompleted: "Pomodoros Concluídos (Últimos 7 Dias)",
      work: "Foco",
      shortBreak: "Pausa Curta",
      longBreak: "Pausa Longa",
      tasksCompleted: "Tarefas Concluídas",
      pomodoros: "Pomodoros",
      noSessionData: "Sem dados de sessão para exibir a distribuição do tempo.",
    },
    themeToggle: {
      light: "Claro",
      dark: "Escuro",
      system: "Sistema",
    },
     motivationalMessage: {
      closeAltText: "Fechar mensagem motivacional",
      fetchErrorTitle: "Citação Indisponível",
      fetchErrorMessage: "Não foi possível buscar uma citação motivacional no momento. Verifique sua conexão ou tente novamente mais tarde.",
      translationError: "Não foi possível traduzir a citação no momento.",
      dismissButton: "Dispensar",
      loadingQuote: "Carregando um pensamento inspirador...",
    },
    tooltips: {
      // AppHeader
      dashboard: "Ver Painel",
      changeLanguage: "Mudar Idioma",
      appSettings: "Configurações da Aplicação",
      toggleTheme: "Alternar Tema",
      // PomodoroTimer
      resetTimer: "Resetar Timer",
      startTimer: "Iniciar Timer",
      pauseTimer: "Pausar Timer",
      skipSession: "Pular Sessão Atual",
      timerSettings: "Configurações do Timer",
      // TaskList - Main
      addTask: "Adicionar nova tarefa",
      // TaskList - Dialog
      useRecurringTask: "Usar um modelo de tarefa recorrente",
      addTag: "Adicionar esta etiqueta à tarefa",
      pickTagColor: "Escolher uma cor para a nova etiqueta",
      addStep: "Adicionar uma nova etapa à tarefa",
      saveAsRecurring: "Salvar detalhes da tarefa atual como novo modelo recorrente",
      deleteTaskFromDialog: "Excluir esta tarefa permanentemente",
      // TaskList - List Management
      saveCurrentList: "Salvar lista de tarefas atual",
      loadSavedList: "Carregar uma lista de tarefas salva anteriormente",
      // TaskList - Load List Dialog
      loadThisList: "Carregar esta lista",
      renameThisList: "Renomear esta lista",
      deleteThisList: "Excluir esta lista salva",
      // TaskItem
      markTaskComplete: "Marcar tarefa como concluída",
      markTaskIncomplete: "Marcar tarefa como incompleta",
      activateTask: "Definir como tarefa ativa para o timer",
      deactivateTask: "Desativar esta tarefa",
      editTask: "Editar detalhes da tarefa",
      deleteTask: "Excluir esta tarefa",
      activeTaskBadge: "Esta tarefa está ativa para o timer",
      showTaskDetails: "Mostrar detalhes da tarefa",
      hideTaskDetails: "Ocultar detalhes da tarefa",
      // CompletedTasksList (Dashboard)
      restoreTask: "Restaurar esta tarefa para a lista de Tarefas",
      deleteTaskPermanently: "Excluir esta tarefa permanentemente (não pode ser desfeito)",
    }
  },
};


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const tFunction = useCallback((section: string, key: string, ...args: any[]) => {
    const langTranslations = translations[language] || translations['en'];
    const sectionTranslations = langTranslations[section] || (translations['en'][section] || {});
    let template = sectionTranslations[key];

    if (typeof template !== 'function' && (translations['en'][section]?.[key] && typeof translations['en'][section]?.[key] === 'function')) {
      template = translations['en'][section]?.[key];
    } else if (typeof template !== 'function' && typeof template !== 'string') {
       const englishTemplate = translations['en'][section]?.[key];
       if (typeof englishTemplate === 'string') {
         template = englishTemplate;
       } else if (typeof englishTemplate === 'function') {
         template = englishTemplate;
       } else {
         console.warn(`Translation template not found for ${section}.${key} in ${language}, and no valid English fallback.`);
         template = `${section}.${key}`;
       }
    } else if (typeof template === 'undefined') {
        const englishSectionTranslations = translations['en'][section] || {};
        template = englishSectionTranslations[key];
        if (typeof template === 'undefined') {
            console.warn(`Translation template not found for ${section}.${key} in ${language}, and no English fallback found.`);
            template = `${section}.${key}`;
        }
    }

    if (typeof template === 'function') {
      try {
        return template(...args);
      } catch (e) {
        console.error(`Error executing translation function for ${section}.${key} with args:`, args, e);
        return `${section}.${key}(error)`;
      }
    }
    return String(template || `${section}.${key}`);
  }, [language]);


  const tSafe = useCallback((path: string, sectionOverride?: string): string => {
    const keys = path.split('.');
    let actualSection = sectionOverride;
    let actualKey = path;

    if (!sectionOverride && keys.length > 1) {
        actualSection = keys[0];
        actualKey = keys.slice(1).join('.');
    } else if (sectionOverride) {
        actualKey = path;
    }

    let current: any = translations[language];
    if (actualSection) {
        current = current?.[actualSection];
    }

    const keyParts = actualKey.split('.');
    let value = current;
    for (const part of keyParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value === 'string') return value;
    if (typeof value === 'function') {
         console.warn(`Translation for '${path}' (section: ${actualSection || 'none'}) resolved to a function. 't' should be used for strings. Path returned.`);
         return `${actualSection ? actualSection + '.' : ''}${actualKey}`;
    }

    // Fallback to English
    let fallback: any = translations['en'];
     if (actualSection) {
        fallback = fallback?.[actualSection];
    }
    const fallbackKeyParts = actualKey.split('.');
    let fallbackValue = fallback;
    for (const part of fallbackKeyParts) {
      if (fallbackValue && typeof fallbackValue === 'object' && part in fallbackValue) {
        fallbackValue = fallbackValue[part];
      } else {
        fallbackValue = undefined;
        break;
      }
    }

    if (typeof fallbackValue === 'string') return fallbackValue;
    if (typeof fallbackValue === 'function') {
        console.warn(`English fallback for '${path}' (section: ${actualSection || 'none'}) resolved to a function. Path returned.`);
        return `${actualSection ? actualSection + '.' : ''}${actualKey}`;
    }
    
    console.warn(`Translation not found for '${path}' (section: ${actualSection || 'none'}) in language '${language}' or English fallback. Path returned.`);
    return `${actualSection ? actualSection + '.' : ''}${actualKey}`;
  }, [language]);


  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t: tSafe,
    tFunction
  }), [language, setLanguage, tSafe, tFunction]);


  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const getTranslationFunction = <T extends (...args: any[]) => string>(
  lang: Language,
  section: string,
  key: string
): T => {
  const langTranslations = translations[lang] || translations['en'];
  const sectionTranslations = langTranslations[section] || (translations['en'][section] || {});
  let func = sectionTranslations[key];

  if (typeof func !== 'function') {
    const fallbackSectionTranslations = translations['en'][section] || {};
    func = fallbackSectionTranslations[key];
  }

  if (typeof func === 'function') {
    return func as T;
  }
  
  const fullPath = `${section}.${key}`;
  const specificFallbacks: Record<string, Record<string, (...args: any[]) => string>> = {
    taskList: {
      moreTags: (params = { count: 0 }) => `+${params.count} more (fallback)`,
      confirmDelete: (taskTitle: string) => `Confirm delete: ${taskTitle} (fallback)`,
      recurringTaskSavedDescription: (title: string) => `Recurring: ${title} (fallback)`,
      confirmDeleteRecurring: (title: string) => `Confirm delete recurring: ${title} (fallback)`,
      recurringTaskDeletedDescription: (title: string) => `Recurring deleted: ${title} (fallback)`,
      listLoadedSuccess: (name: string) => `Loaded: ${name} (fallback)`,
      listSavedSuccess: (name: string) => `Saved: ${name} (fallback)`,
      listNameExistsError: (name: string) => `Exists: ${name} (fallback)`,
      listRenamedSuccess: (oldName: string, newName: string) => `Renamed: ${oldName} to ${newName} (fallback)`,
      confirmDeleteListMessage: (name: string) => `Confirm delete list: ${name} (fallback)`,
      listDeletedSuccess: (name: string) => `List deleted: ${name} (fallback)`,

    },
    pomodoroTimer: {
      focusOnTaskTitle: (taskTitle: string) => `Focus: ${taskTitle} (fallback)`,
      taskTimeUpDescription: (taskTitle: string) => `Time up: ${taskTitle} (fallback)`,
      confirmSkip: (sessionType: string) => `Skip ${sessionType}? (fallback)`,
    },
    homePage: {
      taskAddedDescription: (title: string) => `Added: ${title} (fallback)`,
      taskUpdatedDescription: (title: string) => `Updated: ${title} (fallback)`,
      taskCompleteDescription: (title: string) => `Complete: ${title} (fallback)`,
      taskDeletedDescription: (title: string) => `Deleted: ${title} (fallback)`,
    },
    dashboardPage: {
      taskRestoredDescription: (title: string) => `Restored: ${title} (fallback)`,
      taskDeletedDescription: (title: string) => `Permanently deleted: ${title} (fallback)`,
      confirmPermanentDelete: (title: string) => `Confirm perm. delete: ${title} (fallback)`,
    },
    taskItem: {
      stepCompleted: (completed: number, total: number) => `${completed}/${total} (fallback)`,
    },
    settingsDialog: {
        confirmResetThemeMessage: (mode: string) => `Reset ${mode} theme? (fallback)`,
    },
    completedTasksList: {
        minutesOfProductivity: (minutes: number) => `${minutes}m productivity (fallback)`,
        minutesOfDelay: (minutes: number) => `${minutes}m delay (fallback)`,
    }
  };

  if (specificFallbacks[section] && specificFallbacks[section][key]) {
    console.warn(`Translation function not found for ${fullPath} in language ${lang}. Using specific function fallback.`);
    return specificFallbacks[section][key] as T;
  }

  return ((..._args: any[]) => {
    console.warn(`Translation function not found for ${fullPath} in language ${lang}. Returning path.`);
    return fullPath;
  }) as T;
};
