import dayjs from "dayjs";
import { AlertCircle, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import WithAuthentication from "@/hocs/with-authentication";
import { getSession } from "@/lib/get-session";

import { appointmentsTableColumns } from "../appointments/_components/table-columns";
import AgeDistribution from "./_components/age-distribution";
import AppointmentsChart from "./_components/appointments-chart";
import BloodTypeDistribution from "./_components/blood-type-distribution";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopDoctors from "./_components/top-doctors";
import TopSpecialties from "./_components/top-specialties";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  // Inicia session e searchParams em paralelo — ambos são independentes
  const [session, resolvedSearchParams] = await Promise.all([
    getSession(),
    searchParams,
  ]);

  // Usa defaults quando os params estão ausentes — evita redirect que causava flash preto
  const from = resolvedSearchParams.from ?? dayjs().format("YYYY-MM-DD");
  const to =
    resolvedSearchParams.to ?? dayjs().add(1, "month").format("YYYY-MM-DD");

  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
    bloodTypeDistribution,
    ageDistribution,
    patientsWithAllergies,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session!.user.clinic!.id,
        },
      },
    },
  });

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Dashboard</PageTitle>
            <PageDescription>
              Tenha uma visão geral da sua clínica.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <DatePicker />
          </PageActions>
        </PageHeader>
        <PageContent>
          <StatsCards
            totalRevenue={
              totalRevenue.total ? Number(totalRevenue.total) : null
            }
            totalAppointments={totalAppointments.total}
            totalPatients={totalPatients.total}
            totalDoctors={totalDoctors.total}
          />

          {/* Alert Card: Pacientes com Alergias */}
          {patientsWithAllergies > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>{patientsWithAllergies} paciente{patientsWithAllergies > 1 ? "s" : ""}</strong> com alergias registradas.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-[2.25fr_1fr]">
            <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
            <TopDoctors doctors={topDoctors} />
          </div>
          <div className="grid gap-4 md:grid-cols-[2.25fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground" />
                  <CardTitle className="text-base">
                    Agendamentos de hoje
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={appointmentsTableColumns}
                  data={todayAppointments}
                />
              </CardContent>
            </Card>
            <TopSpecialties topSpecialties={topSpecialties} />
          </div>

          {/* Nova linha: Distribuição por Tipo Sanguíneo + Faixa Etária */}
          <div className="grid gap-4 md:grid-cols-2">
            <BloodTypeDistribution
              data={bloodTypeDistribution}
              total={totalPatients.total}
            />
            <AgeDistribution
              data={ageDistribution}
              total={ageDistribution.reduce((acc, d) => acc + d.count, 0)}
            />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DashboardPage;
