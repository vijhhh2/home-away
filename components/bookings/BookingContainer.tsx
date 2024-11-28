'use client';

import { useProperty } from '@/utils/store';
import BookingForm from '@/components/bookings/BookingForm';
import ConfirmBooking from '@/components/bookings/ConfirmBooking';

const BookingContainer = () => {
    const { bookings, propertyId, range, price } = useProperty(
        (state) => state
    );
    console.log(bookings, propertyId, range, price);
    return (
        <div className="w-full">
            <BookingForm />
            <ConfirmBooking />
        </div>
    );
};

export default BookingContainer;
