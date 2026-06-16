"use client";

import { CalendarDays, TableIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable } from "@/db/schema";

import AppointmentCalendarView from "./appointment-calendar-view";
import { appointmentsTableColumns } from "./table-columns";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

interface AppointmentsViewToggleProps {
  appointments: AppointmentWithRelations[];
}

export default function AppointmentsViewToggle({
  appointments,
}: AppointmentsViewToggleProps) {
  const [view, setView] = useState<"table" | "calendar">("table");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <Button
          variant={view === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("table")}
        >
          <TableIcon className="mr-1 h-4 w-4" />
          Tabela
        </Button>
        <Button
          variant={view === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("calendar")}
        >
          <CalendarDays className="mr-1 h-4 w-4" />
          Calendário
        </Button>
      </div>

      {view === "table" ? (
        <DataTable
          data={appointments}
          columns={appointmentsTableColumns}
          searchKey="patient.name"
          searchPlaceholder="Pesquisar por paciente..."
        />
      ) : (
        <AppointmentCalendarView appointments={appointments} />
      )}
    </div>
  );
}
