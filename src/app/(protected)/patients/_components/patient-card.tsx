"use client";

import {
  Calendar,
  Droplets,
  Heart,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { patientsTable } from "@/db/schema";

interface PatientCardProps {
  patient: typeof patientsTable.$inferSelect;
}

const bloodTypeBadgeColors: Record<string, string> = {
  "A+": "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
  "A-": "border-red-200 bg-red-50/50 text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300",
  "B+": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
  "B-": "border-blue-200 bg-blue-50/50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300",
  "AB+": "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400",
  "AB-": "border-purple-200 bg-purple-50/50 text-purple-600 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-300",
  "O+": "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
  "O-": "border-green-200 bg-green-50/50 text-green-600 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300",
};

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

const PatientCard = ({ patient }: PatientCardProps) => {
  const patientInitials = patient.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getSexLabel = (sex: "male" | "female") => {
    return sex === "male" ? "Masculino" : "Feminino";
  };

  const age = calculateAge(patient.dateOfBirth);

  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {patientInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{patient.name}</h3>
            <p className="text-muted-foreground text-xs">
              {getSexLabel(patient.sex)}
              {age !== null && ` · ${age} anos`}
            </p>
          </div>
          {patient.bloodType && (
            <Badge
              variant="outline"
              className={`font-bold ${bloodTypeBadgeColors[patient.bloodType] ?? ""}`}
            >
              <Droplets className="mr-1 h-3 w-3" />
              {patient.bloodType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{patient.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{formatPhoneNumber(patient.phoneNumber)}</span>
        </div>
        {patient.allergies && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <Heart className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Alergias: {patient.allergies}</span>
          </div>
        )}
        {patient.dateOfBirth && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Nasc: {new Date(patient.dateOfBirth).toLocaleDateString("pt-BR")}</span>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="pt-3">
        <Button variant="default" size="sm" className="w-full" asChild>
          <Link href={`/patients/${patient.id}`}>
            Ver perfil completo
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
