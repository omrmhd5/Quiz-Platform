"use client";

import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";
import { DASHBOARD_TREND_SESSIONS, type DashboardView } from "@/lib/dashboard";
import {
  cn,
  emptyStateClassName,
  panelClassName,
  sectionDescriptionClassName,
  sectionTitleClassName,
} from "@/lib/utils";

type DashboardChartsProps = {
  stats: DashboardView;
};

const CHART_COLORS = {
  correct: "#22c55e",
  wrong: "#ef4444",
  skipped: "#a1a1aa",
  submitted: "#22c55e",
  didntFinish: "#ef4444",
  inProgress: "#f59e0b",
  score: "#18181b",
};

function ChartPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(panelClassName, "space-y-4", className)}>
      <div>
        <h2 className={sectionTitleClassName}>{title}</h2>
        <p className={sectionDescriptionClassName}>{description}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <p
      className={cn(
        emptyStateClassName,
        "flex h-52 items-center justify-center sm:h-64",
      )}>
      {message}
    </p>
  );
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const t = useTranslations("dashboard");
  const answerBreakdown = [
    { name: t("correct"), value: stats.totalCorrect, color: CHART_COLORS.correct },
    { name: t("wrong"), value: stats.totalWrong, color: CHART_COLORS.wrong },
    { name: t("skipped"), value: stats.totalSkipped, color: CHART_COLORS.skipped },
  ].filter((item) => item.value > 0);

  const participationBreakdown = [
    {
      name: t("submitted"),
      value: stats.submittedCount,
      color: CHART_COLORS.submitted,
    },
    {
      name: t("didntFinish"),
      value: stats.didntFinishCount,
      color: CHART_COLORS.didntFinish,
    },
    {
      name: t("inProgress"),
      value: stats.liveInProgressCount,
      color: CHART_COLORS.inProgress,
    },
  ].filter((item) => item.value > 0);

  const scoreTrendData = stats.scoreTrend
    .filter((point) => point.averageScore !== null)
    .map((point) => ({
      label: point.label,
      score: point.averageScore as number,
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartPanel
        title={t("answerBreakdown")}
        description={t("answerBreakdownHint")}>
        {answerBreakdown.length === 0 ? (
          <EmptyChart message={t("answerChartEmpty")} />
        ) : (
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={answerBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={92}
                  paddingAngle={2}>
                  {answerBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, t("answers")]}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#e4e4e7",
                    fontSize: "13px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartPanel>

      <ChartPanel
        title={t("participation")}
        description={t("participationHint")}>
        {participationBreakdown.length === 0 ? (
          <EmptyChart message={t("participationEmpty")} />
        ) : (
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={participationBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={92}
                  paddingAngle={2}>
                  {participationBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, t("attempts")]}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#e4e4e7",
                    fontSize: "13px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartPanel>

      <ChartPanel
        title={t("scoreTrend")}
        description={t("lastSessionsTrend", { count: DASHBOARD_TREND_SESSIONS })}
        className="lg:col-span-2">
        {scoreTrendData.length === 0 ? (
          <EmptyChart message={t("scoreTrendEmpty")} />
        ) : (
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoreTrendData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#f4f4f5" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, t("averageScore")]}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#e4e4e7",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={CHART_COLORS.score}
                  strokeWidth={2}
                  dot={{ r: 4, fill: CHART_COLORS.score }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartPanel>
    </div>
  );
}
