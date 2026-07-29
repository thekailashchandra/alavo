import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/Logo.png"
      alt="Alavo"
      width={2049}
      height={1152}
      priority={priority}
      className={cn("h-auto w-full max-w-[200px] object-contain object-left", className)}
    />
  );
}
