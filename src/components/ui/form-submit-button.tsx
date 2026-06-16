import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormSubmitButtonProps
  extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
}

export function FormSubmitButton({
  isLoading,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: FormSubmitButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(isLoading && "cursor-not-allowed", className)}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? loadingText || "Salvando..." : children}
    </Button>
  );
}
