import CardWrapper, { Card } from '@/app/dashboard/cards';
import RevenueChart from '@/app/dashboard/revenue-chart';
import LatestInvoices from '@/app/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';
import { CardSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton } from '@/app/ui/skeletons';
 
export default async function Page() { //eu pude colocar essa função como async pois ela é server-side rendering SSR, isso me permite utilizar await
    const CardData = await fetchCardData()

    // const data = await Promise.all([
    //   fetchRevenue(),
    //   fetchLatestInvoices(),
    //   fetchCardData()
    // ])

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardSkeleton/>}>
          <CardWrapper/>
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton/>}> {/*"Suspense" é utilizado pelo React para criar carregamento de componentes */}
          <RevenueChart/>
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton/>}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}