import { Droplets } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface BloodTypeDistributionProps {
  data: { bloodType: string; count: number }[];
  total: number;
}

const bloodTypeColors: Record<string, string> = {
  "A+": "#ef4444",
  "A-": "#fca5a5",
  "B+": "#3b82f6",
  "B-": "#93c5fd",
  "AB+": "#a855f7",
  "AB-": "#d8b4fe",
  "O+": "#22c55e",
  "O-": "#86efac",
};

export default function BloodTypeDistribution({
  data,
  total,
}: BloodTypeDistributionProps) {
  if (data.length === 0) {
    return (
      <Card className="mx-auto w-full">
        <CardContent>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplets className="text-muted-foreground" />
              <CardTitle className="text-base">Tipos Sanguíneos</CardTitle>
            </div>
          </div>
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum dado de tipo sanguíneo registrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="text-muted-foreground" />
            <CardTitle className="text-base">Tipos Sanguíneos</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">{total} pacientes</span>
        </div>
        <div className="space-y-4">
          {sorted.map((item) => {
            const progressValue = (item.count / maxCount) * 100;
            return (
              <div key={item.bloodType} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.bloodType}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({Math.round((item.count / total) * 100)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progressValue}%`,
                      backgroundColor: bloodTypeColors[item.bloodType] ?? "#3b82f6",
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
