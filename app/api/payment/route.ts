import { NextRequest, NextResponse } from 'next/server';
import db from '../../../utils/db';
import Stripe from 'stripe';
import { formatDate } from '../../../utils/format';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const POST = async (req: NextRequest, res: NextResponse) => {
    const requestHeaders = new Headers(req.headers);
    const origin = requestHeaders.get('origin');

    const { bookingId } = await req.json();

    const booking = await db.booking.findUnique({
        where: {
            id: bookingId,
        },
        include: {
            property: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!booking) {
        return Response.json(null, {
            status: 400,
        });
    }

    const {
        totalNights,
        orderTotal,
        checkIn,
        checkOut,
        property: { image, name },
    } = booking;

    try {
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            metadata: {
                bookingId,
            },
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${name}`,
                            images: [image],
                            description: `Stay in this wonderful place for ${totalNights} nights, from ${formatDate(
                                checkIn
                            )} to ${formatDate(checkOut)}. Enjoy your stay!`,
                        },
                        unit_amount: orderTotal * 100,
                    },
                },
            ],
            mode: 'payment',
            return_url: `${origin}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
        });
        return Response.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.log(error);
        return Response.json(null, {
            status: 500,
            statusText: 'Internal Server Error',
        });
    }
};
