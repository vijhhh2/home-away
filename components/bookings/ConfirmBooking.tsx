'use client';

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useProperty } from "../../utils/store";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "../form/Buttons";
import FormContainer from "../form/FormContainer";
import { createBookingAction } from "../../utils/actions";

const ConfirmBooking = () => {
    const { userId } = useAuth();
    const { propertyId, range } = useProperty(s => s);
    const checkIn = range?.from as Date;
    const checkOut = range?.to as Date;

    if (!userId) {
       return <SignInButton mode="modal">
        <Button type="button" className="w-full">
            Sign In to Complete Booling
        </Button>
       </SignInButton> 
    }

    const createBooking = createBookingAction.bind(null, { propertyId, checkIn, checkOut });

    return (
        <section>
            <FormContainer action={createBooking}>
                <SubmitButton text="Reserve" className="w-full" />
            </FormContainer>
        </section>
    );
};

export default ConfirmBooking;