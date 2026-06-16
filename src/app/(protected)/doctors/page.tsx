import { eq } from "drizzle-orm";
import { Stethoscope } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ExportButton } from "@/components/export-button";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { getSession } from "@/lib/get-session";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await getSession();

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session!.user.clinic!.id),
  });
  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Médicos</PageTitle>
            <PageDescription>
              Gerencie os médicos da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <ExportButton entity="doctors" />
            <AddDoctorButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          {doctors.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="Nenhum médico cadastrado"
              description="Adicione médicos para começar a agendar consultas."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DoctorsPage;
