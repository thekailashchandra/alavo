"use client";

import Image from "next/image";
import type { ComponentProps } from "react";
import logo from "../assets/Logo.png";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
} & Omit<ComponentProps<typeof Image>, "src" | "alt" | "width" | "height">;

export function BrandLogo({ className, priority, ...props }: BrandLogoProps) {
  return (
    <Image
      src={logo}
      alt="Alavo"
      width={2049}
      height={1152}
      priority={priority}
      className={["h-auto w-full object-contain object-left", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export { brand } from "./brand";
