import {
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  totalDoctors,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: DollarSignIcon,
      trend: totalRevenue && totalRevenue > 0 ? "+12%" : null,
      trendUp: true,
    },
    {
      title: "Agendamentos",
      value: totalAppointments.toString(),
      icon: CalendarIcon,
      trend: totalAppointments > 0 ? "+8%" : null,
      trendUp: true,
    },
    {
      title: "Pacientes",
      value: totalPatients.toString(),
      icon: UserIcon,
      trend: totalPatients > 0 ? "+15%" : null,
      trendUp: true,
    },
    {
      title: "Médicos",
      value: totalDoctors.toString(),
      icon: UsersIcon,
      trend: null,
      trendUp: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                <Icon className="text-primary h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <div
                    className={`flex items-center text-xs font-medium ${
                      stat.trendUp ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    <TrendingUpIcon className="mr-0.5 h-3 w-3" />
                    {stat.trend}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
