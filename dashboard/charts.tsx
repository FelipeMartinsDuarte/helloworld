
"use client"

import type { Task, PomodoroSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, LineChart as LineChartIcon } from 'lucide-react'; // Renamed to avoid conflict
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend,
  Pie,
  Cell,
  Line,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  LineChart as RechartsLineChart
} from 'recharts';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';

interface DashboardChartsProps {
  tasks: Task[];
  sessions: PomodoroSession[];
  workDuration: number; 
  shortBreakDuration: number; 
  longBreakDuration: number; 
}

const CHART_COLORS = {
  work: 'hsl(var(--chart-1))', 
  shortBreak: 'hsl(var(--chart-2))', 
  longBreak: 'hsl(var(--chart-3))', 
  tasks: 'hsl(var(--chart-4))', 
};


const DashboardCharts: React.FC<DashboardChartsProps> = ({ tasks, sessions, workDuration, shortBreakDuration, longBreakDuration }) => {
  const { t } = useLanguage();

  const workTime = sessions.filter(s => s.type === 'work').length * workDuration;
  const shortBreakTime = sessions.filter(s => s.type === 'shortBreak').length * shortBreakDuration;
  const longBreakTime = sessions.filter(s => s.type === 'longBreak').length * longBreakDuration;

  const timeSpentData = [
    { name: t('charts.work'), value: workTime, fill: CHART_COLORS.work },
    { name: t('charts.shortBreak'), value: shortBreakTime, fill: CHART_COLORS.shortBreak },
    { name: t('charts.longBreak'), value: longBreakTime, fill: CHART_COLORS.longBreak },
  ].filter(d => d.value > 0);

  const pieChartConfig = {
    time: { label: "Time (minutes)" },
    [t('charts.work')]: { label: t('charts.work'), color: CHART_COLORS.work },
    [t('charts.shortBreak')]: { label: t('charts.shortBreak'), color: CHART_COLORS.shortBreak },
    [t('charts.longBreak')]: { label: t('charts.longBreak'), color: CHART_COLORS.longBreak },
  }

  const endDate = new Date();
  const startDate = subDays(endDate, 6);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const taskTrendData = dateRange.map(date => {
    const formattedDate = format(date, 'MMM d');
    const tasksCompletedOnDate = tasks.filter(
      task => task.isCompleted && task.completedAt && format(parseISO(task.completedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    return { date: formattedDate, [t('charts.tasksCompleted')]: tasksCompletedOnDate };
  });

  const lineChartConfig = {
    [t('charts.tasksCompleted')]: { label: t('charts.tasksCompleted'), color: CHART_COLORS.tasks },
  }
  
  const pomodoroTrendData = dateRange.map(date => {
    const formattedDate = format(date, 'MMM d');
    const pomodorosOnDate = sessions.filter(
      s => s.type === 'work' && format(parseISO(s.completedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    return { date: formattedDate, [t('charts.pomodoros')]: pomodorosOnDate };
  });

  const barChartConfig = {
    [t('charts.pomodoros')]: { label: t('charts.pomodoros'), color: CHART_COLORS.work },
  }


  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChart className="text-primary" />{t('charts.timeAllocation')}</CardTitle>
        </CardHeader>
        <CardContent>
          {timeSpentData.length > 0 ? (
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-auto w-full max-w-[250px] sm:max-w-[300px]">
              <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={timeSpentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {timeSpentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </RechartsPieChart>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-10">{t('charts.noSessionData')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LineChartIcon className="text-primary" />{t('charts.taskCompletionTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig} className="h-[250px] sm:h-[300px] w-full">
            <RechartsLineChart data={taskTrendData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey={t('charts.tasksCompleted')} stroke={CHART_COLORS.tasks} strokeWidth={3} dot={{r:4}}/>
              <ChartLegend content={<ChartLegendContent />} />
            </RechartsLineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2"> 
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart className="text-primary" />{t('charts.pomodorosCompleted')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-[250px] sm:h-[300px] w-full">
            <RechartsBarChart data={pomodoroTrendData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={t('charts.pomodoros')} fill={CHART_COLORS.work} radius={4} />
              <ChartLegend content={<ChartLegendContent />} />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
