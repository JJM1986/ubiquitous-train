import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function BackButton({ to }) {
  return (
    <Link
      to={to}
      aria-label="Zurück"
      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all flex-shrink-0 touch-manipulation"
    >
      <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
    </Link>
  );
}