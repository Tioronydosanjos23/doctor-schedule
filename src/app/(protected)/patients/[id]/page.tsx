import { and, eq } from "drizzle-orm";
import {
  Briefcase,
  Calendar,
  Droplets,
  Heart,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Scale,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import WithAuthentication from "@/hocs/with-authentication";
import { getSession } from "@/lib/get-session";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const bloodTypeColors: Record<string, string> = {
  "A+": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  "A-": "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800",
  "B+": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  "B-": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "AB+": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  "AB-": "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  "O+": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  "O-": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800",
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

function calculateBMI(weight: string | null, height: string | null): number | null {
  if (!weight || !height) return null;
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100; // convert cm to m
  if (w <= 0 || h <= 0) return null;
  return Math.round((w / (h * h)) * 10) / 10;
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-500" };
  if (bmi < 25) return { label: "Peso normal", color: "text-green-500" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-yellow-500" };
  return { label: "Obesidade", color: "text-red-500" };
}

const getSexLabel = (sex: "male" | "female") => {
  return sex === "male" ? "Masculino" : "Feminino";
};

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

const PatientDetailPage = async ({ params }: PatientDetailPageProps) => {
  const { id } = await params;
  const session = await getSession();

  const patient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.id, id),
      eq(patientsTable.clinicId, session!.user.clinic!.id),
    ),
  });

  if (!patient) {
    notFound();
  }

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.patientId, patient.id),
      eq(appointmentsTable.clinicId, session!.user.clinic!.id),
    ),
    with: {
      doctor: true,
    },
    orderBy: (appointments, { desc }) => [desc(appointments.date)],
  });

  const age = calculateAge(patient.dateOfBirth);
  const bmi = calculateBMI(patient.weight, patient.height);
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/patients" className="hover:text-foreground transition-colors">
                Pacientes
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">{patient.name}</span>
            </div>
            <PageTitle className="mt-2">{patient.name}</PageTitle>
          </PageHeaderContent>
        </PageHeader>

        <PageContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Coluna da esquerda — Perfil + Dados Médicos */}
            <div className="space-y-6 lg:col-span-1">
              {/* Card de Perfil */}
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <UserIcon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="mt-2 text-xl">{patient.name}</CardTitle>
                  <CardDescription>
                    {getSexLabel(patient.sex)}
                    {age !== null && ` · ${age} anos`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phoneNumber.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}</span>
                  </div>
                  {patient.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>{patient.address}</span>
                    </div>
                  )}
                  {patient.occupation && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.occupation}</span>
                    </div>
                  )}
                  {patient.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {dayjs(patient.dateOfBirth).format("DD/MM/YYYY")}
                        {age !== null && ` (${age} anos)`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card de Tipo Sanguíneo */}
              {patient.bloodType && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Droplets className="h-5 w-5 text-red-500" />
                      Tipo Sanguíneo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant="outline"
                      className={`px-4 py-2 text-lg font-bold ${bloodTypeColors[patient.bloodType] ?? ""}`}
                    >
                      {patient.bloodType}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Card de Métricas Corporais */}
              {(patient.weight || patient.height || bmi) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-5 w-5 text-rose-500" />
                      Métricas Corporais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {patient.weight && (
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <Scale className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                          <div className="text-lg font-bold">{patient.weight} kg</div>
                          <div className="text-xs text-muted-foreground">Peso</div>
                        </div>
                      )}
                      {patient.height && (
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <Ruler className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                          <div className="text-lg font-bold">{patient.height} cm</div>
                          <div className="text-xs text-muted-foreground">Altura</div>
                        </div>
                      )}
                      {bmi && (
                        <div className="col-span-2 rounded-lg bg-muted/50 p-3 text-center">
                          <div className="text-lg font-bold">
                            IMC: {bmi} kg/m²
                          </div>
                          <div className={bmiCategory!.color}>
                            {bmiCategory!.label}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Coluna da direita — Histórico Médico + Consultas */}
            <div className="space-y-6 lg:col-span-2">
              {/* Card de Alergias e Condições */}
              {(patient.allergies || patient.chronicConditions || patient.medications) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-5 w-5 text-rose-500" />
                      Histórico Médico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {patient.allergies && (
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Alergias
                        </h4>
                        <p className="text-sm">{patient.allergies}</p>
                      </div>
                    )}
                    {patient.chronicConditions && (
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Condições Crônicas
                        </h4>
                        <p className="text-sm">{patient.chronicConditions}</p>
                      </div>
                    )}
                    {patient.medications && (
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Medicamentos em Uso
                        </h4>
                        <p className="text-sm">{patient.medications}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Card de Contato de Emergência */}
              {(patient.emergencyContactName || patient.emergencyContactPhone) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Phone className="h-5 w-5 text-amber-500" />
                      Contato de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {patient.emergencyContactName && (
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{patient.emergencyContactName}</span>
                        </div>
                      )}
                      {patient.emergencyContactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {patient.emergencyContactPhone.replace(
                              /(\d{2})(\d{5})(\d{4})/,
                              "($1) $2-$3",
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observações */}
              {patient.observations && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Stethoscope className="h-5 w-5 text-muted-foreground" />
                      Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{patient.observations}</p>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Consultas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Histórico de Consultas
                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                      {appointments.length} {appointments.length === 1 ? "consulta" : "consultas"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Nenhuma consulta registrada para este paciente.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Dr(a). {appointment.doctor.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.doctor.specialty}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {dayjs(appointment.date)
                                .tz("Africa/Luanda")
                                .format("DD/MM/YYYY")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dayjs(appointment.date)
                                .tz("Africa/Luanda")
                                .format("HH:mm")}
                              {" · "}
                              {formatCurrencyInCents(appointment.appointmentPriceInCents)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default PatientDetailPage;
