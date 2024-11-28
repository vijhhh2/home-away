'use client';
import { useProperty } from '@/utils/store';
import { Booking } from '@/utils/types';
import { useEffect } from 'react';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import BookingContainer from '@/components/bookings/BookingContainer';

type BookingWrapperProps = {
    propertyId: string;
    price: number;
    bookings: Booking[];
};

const BookingWrapper = ({
    propertyId,
    price,
    bookings,
}: BookingWrapperProps) => {
    useEffect(() => {
        useProperty.setState({
            propertyId,
            price,
            bookings,
        });
    }, []);
    return (
        <>
            <BookingCalendar />
            <BookingContainer />
        </>
    );
};

export default BookingWrapper;
