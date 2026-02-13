import { EditPriceQuoteView } from "@/app/modules/price-quotes/ui/views/edit-price-quote-view";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function EditPriceQuotePage() {
  return <EditPriceQuoteView />;
}
