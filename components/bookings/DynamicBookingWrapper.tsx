'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicBookingWrapper = dynamic(() => import('./BookingWrapper'), {
    ssr: false,
    loading: () => <Skeleton className="h-[200px] w-full" />,
});
export default DynamicBookingWrapper;
