import { z } from "zod";
import i18n from "@/i18n";

export function setupZodI18n() {
  z.setErrorMap((issue, ctx) => {
    const t = i18n.t.bind(i18n);

    switch (issue.code) {
      case z.ZodIssueCode.too_small:
        if (issue.type === "string") {
          if (issue.minimum === 1) {
            return { message: t("validation:required") };
          }
          return {
            message: t("validation:min_length", { min: issue.minimum }),
          };
        }
        break;
      case z.ZodIssueCode.too_big:
        if (issue.type === "string") {
          return {
            message: t("validation:max_length", { max: issue.maximum }),
          };
        }
        break;
      case z.ZodIssueCode.invalid_format:
        if (issue.format === "email") {
          return { message: t("validation:email_invalid") };
        }
        break;
    }

    return { message: ctx.defaultError };
  });
}
