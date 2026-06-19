import { Stethoscope, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface TopDoctorsProps {
  doctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    specialty: string;
    appointments: number;
    revenue?: number;
  }[];
}

export default function TopDoctors({ doctors }: TopDoctorsProps) {
  const maxAppointments = Math.max(...doctors.map((d) => d.appointments), 1);

  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-muted-foreground" />
            <CardTitle className="text-base">
              Ranking de Médicos
            </CardTitle>
          </div>
        </div>

        <div className="space-y-5">
          {doctors.map((doctor, idx) => {
            const progressWidth =
              (doctor.appointments / maxAppointments) * 100;
            return (
              <div key={doctor.id}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-muted-foreground text-xs font-bold tabular-nums w-4 shrink-0">
                      {idx + 1}°
                    </span>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">
                        {doctor.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-semibold tabular-nums">
                      {doctor.appointments}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      consultas
                    </div>
                  </div>
                </div>
                {/* Mini barra de progresso */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
