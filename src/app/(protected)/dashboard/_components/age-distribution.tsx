import { Users } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface AgeDistributionProps {
  data: { range: string; count: number }[];
  total: number;
}

const ageColors = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f97316",
  "#ef4444",
  "#a78bfa",
];

export default function AgeDistribution({
  data,
  total,
}: AgeDistributionProps) {
  if (data.length === 0) {
    return (
      <Card className="mx-auto w-full">
        <CardContent>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-muted-foreground" />
              <CardTitle className="text-base">Faixa Etária</CardTitle>
            </div>
          </div>
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum dado de idade registrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-muted-foreground" />
            <CardTitle className="text-base">Faixa Etária</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {total} pacientes
          </span>
        </div>
        <div className="space-y-4">
          {data.map((item, index) => {
            const progressValue = (item.count / maxCount) * 100;
            return (
              <div key={item.range} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.range}</span>
                  <span className="text-muted-foreground">
                    {item.count} (
                    {total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressValue}%`,
                      backgroundColor:
                        ageColors[index % ageColors.length] ?? "#3b82f6",
                    }}
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
