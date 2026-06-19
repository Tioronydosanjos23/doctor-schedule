import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, count, desc, eq, gte, isNotNull, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Params {
  from: string;
  to: string;
  session: {
    user: {
      clinic: {
        id: string;
      };
    };
  };
}

export const getDashboard = async ({ from, to, session }: Params) => {
  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();
  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [totalDoctors],
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
    bloodTypeDistribution,
    ageDistribution,
    [patientsWithAllergies],
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        total: count(),
      })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, doctorsTable.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .where(eq(doctorsTable.clinicId, session.user.clinic.id))
      .groupBy(doctorsTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    db
      .select({
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .groupBy(doctorsTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(
          appointmentsTable.date,
          dayjs().tz("Africa/Luanda").startOf("day").toDate(),
        ),
        lte(
          appointmentsTable.date,
          dayjs().tz("Africa/Luanda").endOf("day").toDate(),
        ),
      ),
      with: {
        patient: true,
        doctor: true,
      },
    }),
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        appointments: count(appointmentsTable.id),
        revenue:
          sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
            "revenue",
          ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
    // Blood type distribution
    db
      .select({
        bloodType: patientsTable.bloodType,
        count: count(),
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, session.user.clinic.id),
          isNotNull(patientsTable.bloodType),
        ),
      )
      .groupBy(patientsTable.bloodType)
      .orderBy(desc(count())),
    // Age distribution
    db
      .select({
        range: sql<string>`CASE
          WHEN EXTRACT(YEAR FROM AGE(${patientsTable.dateOfBirth})) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(${patientsTable.dateOfBirth})) BETWEEN 18 AND 30 THEN '18-30'
          WHEN EXTRACT(YEAR FROM AGE(${patientsTable.dateOfBirth})) BETWEEN 31 AND 45 THEN '31-45'
          WHEN EXTRACT(YEAR FROM AGE(${patientsTable.dateOfBirth})) BETWEEN 46 AND 60 THEN '46-60'
          ELSE '60+'
        END`.as("range"),
        count: count(),
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, session.user.clinic.id),
          isNotNull(patientsTable.dateOfBirth),
        ),
      )
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    // Patients with allergies count
    db
      .select({
        total: count(),
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, session.user.clinic.id),
          isNotNull(patientsTable.allergies),
          sql`TRIM(${patientsTable.allergies}) != ''`,
        ),
      ),
  ]);
  return {
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
    patientsWithAllergies: patientsWithAllergies?.total ?? 0,
  };
};
