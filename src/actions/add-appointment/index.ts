"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { notifyPatient } from "@/helpers/notify-patient";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { addAppointmentSchema } from "./schema";

dayjs.extend(utc);
dayjs.extend(timezone);

export const addAppointment = protectedWithClinicActionClient
  .schema(addAppointmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });
    if (!availableTimes?.data) {
      throw new Error("No available times");
    }
    const isTimeAvailable = availableTimes.data?.some(
      (time) => time.value === parsedInput.time && time.available,
    );
    if (!isTimeAvailable) {
      throw new Error("Time not available");
    }
    const appointmentDateTime = dayjs(parsedInput.date)
      .tz("Africa/Luanda")
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .set("second", 0)
      .utc()
      .toDate();

    await db.insert(appointmentsTable).values({
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
      date: appointmentDateTime,
    });

    const patient = await db.query.patientsTable.findFirst({
      where: (patients, { eq }) => eq(patients.id, parsedInput.patientId),
    });

    const doctor = await db.query.doctorsTable.findFirst({
      where: (doctors, { eq }) => eq(doctors.id, parsedInput.doctorId),
    });

    if (patient && doctor) {
      try {
        await notifyPatient({
          patientName: patient.name,
          patientEmail: patient.email,
          patientPhone: patient.phoneNumber,
          doctorName: doctor.name,
          doctorSpecialty: doctor.specialty,
          appointmentDate: appointmentDateTime,
          clinicName: ctx.user.clinic.name,
        });
      } catch (notifyError) {
        console.error("Erro ao notificar paciente:", notifyError);
      }
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });
