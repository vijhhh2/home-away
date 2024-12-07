'use client';

import { useProperty } from '@/utils/store';
import BookingForm from '@/components/bookings/BookingForm';
import ConfirmBooking from '@/components/bookings/ConfirmBooking';

const BookingContainer = () => {
    const { range} = useProperty(
        (state) => state
    );

    if (!range || !range.from || !range.to) {
        return null;
    }
    if (range.to.getTime() === range.from.getTime()) {
     return null;   
    }
    return (
        <div className="w-full">
            <BookingForm />
            <ConfirmBooking />
        </div>
    );
};

export default BookingContainer;
