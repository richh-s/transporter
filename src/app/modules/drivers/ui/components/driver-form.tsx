"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export function DriverForm() {
  const { t } = useTranslation(["drivers"]);
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          {t("drivers:fields.first_name")}
        </Label>
        <Input id="name" placeholder={t("drivers:fields.first_name")} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="phone" className="text-right">
          {t("drivers:fields.phone_number")}
        </Label>
        <Input id="phone" placeholder={t("drivers:fields.phone_number")} className="col-span-3" />
      </div>
    </div>
  );
}
