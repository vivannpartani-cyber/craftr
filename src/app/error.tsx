"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="glass-card flex max-w-md flex-col items-center p-8 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Something went wrong!</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          An unexpected error occurred. Our engineering team has been notified.
        </p>
        <Button onClick={() => reset()} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
