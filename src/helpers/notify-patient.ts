import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Resend } from "resend";

dayjs.extend(utc);
dayjs.extend(timezone);

interface NotifyPatientParams {
  patientName: string;
  patientEmail: string | null;
  patientPhone: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: Date;
  clinicName: string;
}

function getWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const number = cleaned.startsWith("244") ? cleaned : `244${cleaned}`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export async function notifyPatient(params: NotifyPatientParams) {
  const {
    patientName,
    patientEmail,
    patientPhone,
    doctorName,
    doctorSpecialty,
    appointmentDate,
    clinicName,
  } = params;

  const formattedDate = dayjs(appointmentDate)
    .tz("Africa/Luanda")
    .format("DD/MM/YYYY [às] HH:mm");

  const message =
    `Olá ${patientName}!\n\n` +
    `Sua consulta foi agendada com sucesso:\n\n` +
    `📅 Data: ${formattedDate}\n` +
    `👨‍⚕️ Médico: Dr(a). ${doctorName}\n` +
    `💼 Especialidade: ${doctorSpecialty}\n` +
    `🏥 Clínica: ${clinicName}\n\n` +
    `Em caso de dúvida, entre em contato conosco.\n\n` +
    `Equipe ${clinicName}`;

  if (patientEmail) {
    try {
      const resendDomain = process.env.RESEND_DOMAIN || "resend.dev";
      const fromEmail = resendDomain === "resend.dev"
        ? "onboarding@resend.dev"
        : `noreply@${resendDomain}`;

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${clinicName} <${fromEmail}>`,
        to: patientEmail,
        subject: `Consulta agendada - ${formattedDate}`,
        text: message,
      });
      console.log(`Email enviado para ${patientEmail}`);
      return { method: "email" as const };
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  }

  const whatsappUrl = getWhatsAppUrl(patientPhone, message);
  console.log(`Paciente sem email. WhatsApp link: ${whatsappUrl}`);
  return { method: "whatsapp" as const, whatsappUrl };
}
