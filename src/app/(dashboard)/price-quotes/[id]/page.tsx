import { PriceQuoteDetailView } from "@/app/modules/price-quotes/ui/views/price-quote-detail-view";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function PriceQuoteDetailPage() {
  return <PriceQuoteDetailView />;
}
