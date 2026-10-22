import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={
        "rounded-xl border brand-border bg-gray-900/50 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow " +
        className
      }
    >
      {children}
    </div>
  );
}
