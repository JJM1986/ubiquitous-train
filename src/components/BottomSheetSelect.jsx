import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export default function BottomSheetSelect({ value, onChange, options, placeholder = "Wählen...", label, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-orange-300 touch-manipulation", triggerClassName)}
      >
        <span className={current ? "text-gray-900" : "text-gray-400"}>{current?.label || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left pb-2">
            {label && <DrawerTitle>{label}</DrawerTitle>}
          </DrawerHeader>
          <div className="px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] max-h-[60vh] overflow-y-auto">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-left hover:bg-gray-50 touch-manipulation ${o.value === value ? "text-orange-600 font-medium" : "text-gray-900"}`}
              >
                <span>{o.label}</span>
                {o.value === value && <Check className="w-4 h-4 text-orange-500" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}