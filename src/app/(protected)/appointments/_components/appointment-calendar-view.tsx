"use client";

import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import { DayPicker } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(timezone);

type AppointmentWithRelations = {
  id: string;
  date: Date;
  appointmentPriceInCents: number;
  patient: { id: string; name: string };
  doctor: { id: string; name: string; specialty: string };
};

interface AppointmentCalendarViewProps {
  appointments: AppointmentWithRelations[];
}

export default function AppointmentCalendarView({
  appointments,
}: AppointmentCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const appointmentsByDate = appointments.reduce(
    (acc, apt) => {
      const dateKey = dayjs(apt.date)
        .tz("America/Sao_Paulo")
        .format("YYYY-MM-DD");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(apt);
      return acc;
    },
    {} as Record<string, AppointmentWithRelations[]>,
  );

  const selectedDateKey = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : "";
  const selectedDayAppointments = appointmentsByDate[selectedDateKey] || [];

  const hasAppointments = (date: Date) => {
    const key = dayjs(date).format("YYYY-MM-DD");
    return !!appointmentsByDate[key]?.length;
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="pt-6">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            weekStartsOn={1}
            showOutsideDays
            className="w-full"
            formatters={{
              formatWeekdayName: (date) => {
                const weekdays = [
                  "seg",
                  "ter",
                  "qua",
                  "qui",
                  "sex",
                  "sáb",
                  "dom",
                ];
                return weekdays[date.getDay()];
              },
            }}
            classNames={{
              months: "flex flex-col gap-4 w-full",
              month: "flex flex-col gap-4 w-full",
              caption: "flex justify-center pt-1 relative items-center w-full",
              caption_label: "text-sm font-medium",
              nav: "flex items-center gap-1",
              nav_button:
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex w-full justify-between mb-2",
              head_cell:
                "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex items-center justify-center flex-shrink-0",
              row: "flex w-full mt-3 justify-between",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-md w-8 flex-shrink-0",
              day: cn(
                "h-8 w-8 p-0 font-normal inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer",
                "aria-selected:bg-primary aria-selected:text-primary-foreground",
              ),
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today:
                "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/20",
              day_outside:
                "day-outside text-muted-foreground aria-selected:text-muted-foreground",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
            components={{
              DayButton: ({ day, ...props }) => {
                const hasDots = hasAppointments(day.date);
                const isToday = dayjs(day.date).isSame(dayjs(), "day");
                const isSelected = selectedDate
                  ? dayjs(day.date).isSame(selectedDate, "day")
                  : false;
                return (
                  <button
                    {...props}
                    className={cn(
                      "relative h-8 w-8 p-0 font-normal inline-flex items-center justify-center rounded-md",
                      "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isToday &&
                        !isSelected &&
                        "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/20",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {day.date.getDate()}
                    {hasDots && (
                      <span
                        className={cn(
                          "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary",
                        )}
                      />
                    )}
                  </button>
                );
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            {selectedDate
              ? dayjs(selectedDate).format("dddd, DD [de] MMMM")
              : "Selecione um dia"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            {selectedDayAppointments.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nenhum agendamento neste dia.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayAppointments
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((apt) => (
                    <div key={apt.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {apt.patient.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {apt.doctor.name} — {apt.doctor.specialty}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {dayjs(apt.date)
                            .tz("America/Sao_Paulo")
                            .format("HH:mm")}
                        </Badge>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
