"use client";

import { TriangleAlert } from "lucide-react";
import { LEGAL } from "@alavo/brand";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConsentRequiredDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <TriangleAlert className="size-5" aria-hidden />
          </div>
          <AlertDialogTitle>Accept terms to continue</AlertDialogTitle>
          <AlertDialogDescription>
            Tap the checkbox to confirm you are {LEGAL.minimumAge}+ and agree to
            the Terms and Privacy Policy, then try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="w-full sm:w-auto">Got it</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
