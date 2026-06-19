"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

type Patient = typeof patientsTable.$inferSelect;

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const bloodTypeColors: Record<string, string> = {
  "A+": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "A-": "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  "B+": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "B-": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  "AB+": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "AB-": "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  "O+": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "O-": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
};

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
    cell: (params) => {
      const patient = params.row.original;
      return (
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href={`/patients/${patient.id}`} className="font-medium">
            {patient.name}
          </Link>
        </Button>
      );
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const patient = params.row.original;
      const phoneNumber = patient.phoneNumber;
      if (!phoneNumber) return "";
      const formatted = phoneNumber.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3",
      );
      return formatted;
    },
  },
  {
    id: "bloodType",
    accessorKey: "bloodType",
    header: "Tipo Sanguíneo",
    cell: (params) => {
      const bloodType = params.row.original.bloodType;
      if (!bloodType) return <span className="text-muted-foreground">—</span>;
      return (
        <Badge
          variant="outline"
          className={bloodTypeColors[bloodType] ?? ""}
        >
          {bloodType}
        </Badge>
      );
    },
  },
  {
    id: "age",
    header: "Idade",
    cell: (params) => {
      const age = calculateAge(params.row.original.dateOfBirth);
      if (age === null) return <span className="text-muted-foreground">—</span>;
      return <span>{age} anos</span>;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;
      return <PatientsTableActions patient={patient} />;
    },
  },
];
