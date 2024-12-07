'use server';

import {
    createReviewSchema,
    imageSchema,
    profileSchema,
    propertySchema,
    validatedWithZodSchema,
} from './schemas';
import db from './db';
import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { uploadImage } from './supabase';
import { calculateTotal } from './calculateTotal';
import { formatDate } from './format';

const getAuthUser = async () => {
    const user = await currentUser();
    if (!user) {
        throw new Error('You must be logged in to access this route');
    }
    if (!user.privateMetadata.hasProfile) {
        return redirect('/profile/create');
    }
    return user;
};

const renderError = async (error: unknown) => {
    if (error instanceof Error) {
        return {
            message: error.message,
        };
    } else {
        return {
            message: 'An error occurred',
        };
    }
};

export const createProfileAction = async (
    prevState: unknown,
    formData: FormData
) => {
    try {
        const user = await currentUser();
        if (!user) {
            throw new Error('Please login to create a profile');
        }

        const rawData = Object.fromEntries(formData);
        const validatedFields = validatedWithZodSchema(profileSchema, rawData);
        await db.profile.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                profileImage: user.imageUrl ?? '',
                ...validatedFields,
            },
        });
        (await clerkClient()).users.updateUser(user.id, {
            privateMetadata: {
                hasProfile: true,
            },
        });
    } catch (e) {
        return renderError(e);
    }

    redirect('/');
};

export const fetchProfileImage = async () => {
    const user = await currentUser();
    if (!user) {
        return null;
    }

    const profile = await db.profile.findUnique({
        where: {
            clerkId: user.id,
        },
        select: {
            profileImage: true,
        },
    });

    if (!profile) {
        return null;
    }

    return profile.profileImage;
};

export const fetchProfile = async () => {
    const user = await getAuthUser();

    const profile = await db.profile.findUnique({
        where: {
            clerkId: user.id,
        },
    });

    if (!profile) {
        return redirect('/profile/create');
    }

    return profile;
};

export const updateProfileAction = async (
    prevState: unknown,
    formData: FormData
): Promise<{ message: string }> => {
    try {
        const user = await getAuthUser();
        const rawData = Object.fromEntries(formData);
        const data = validatedWithZodSchema(profileSchema, rawData);

        await db.profile.update({
            where: {
                clerkId: user.id,
            },
            data: { ...data },
        });
        revalidatePath('/profile');
        return { message: 'Profile updated successfully' };
    } catch (error) {
        return renderError(error);
    }
};

export const updateProfileImageAction = async (
    prevState: unknown,
    formData: FormData
): Promise<{ message: string }> => {
    const image = formData.get('image') as File;
    const user = await getAuthUser();
    try {
        const validatedFields = validatedWithZodSchema(imageSchema, { image });
        const fullPath = await uploadImage(validatedFields.image);
        await db.profile.update({
            where: {
                clerkId: user.id,
            },
            data: {
                profileImage: fullPath,
            },
        });
        revalidatePath('/profile');
        return { message: 'Profile image updated successfully' };
    } catch (error) {
        return renderError(error);
    }
};

export const createPropertyAction = async (
    prevState: unknown,
    formData: FormData
): Promise<{ message: string }> => {
    const user = await getAuthUser();
    try {
        const rawData = Object.fromEntries(formData);
        const file = formData.get('image') as File;

        const validatedFields = validatedWithZodSchema(propertySchema, rawData);
        const validateImageField = validatedWithZodSchema(imageSchema, {
            image: file,
        });
        const fullPath = await uploadImage(validateImageField.image);

        await db.property.create({
            data: {
                ...validatedFields,
                image: fullPath,
                profileId: user.id,
            },
        });
    } catch (error) {
        return renderError(error);
    }
    redirect('/');
};

export const fetchProperties = async ({
    search = '',
    category,
}: {
    search?: string;
    category?: string;
}) => {
    const properties = await db.property.findMany({
        where: {
            category,
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true,
            name: true,
            tagline: true,
            country: true,
            price: true,
            image: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return properties;
};

export const fetchFavouriteId = async ({
    propertyId,
}: {
    propertyId: string;
}) => {
    const user = await getAuthUser();
    const favourite = await db.favorite.findFirst({
        where: {
            propertyId,
            profileId: user.id,
        },
        select: {
            id: true,
        },
    });
    return favourite?.id || null;
};

export const toggleFavouritesAction = async (prevState: {
    propertyId: string;
    favoriteId: string | null;
    pathname: string;
}) => {
    const user = await getAuthUser();
    const { propertyId, favoriteId, pathname } = prevState;
    try {
        if (favoriteId) {
            await db.favorite.delete({
                where: {
                    id: favoriteId,
                },
            });
        } else {
            await db.favorite.create({
                data: {
                    propertyId,
                    profileId: user.id,
                },
            });
        }
        revalidatePath(pathname);
        return {
            message: favoriteId
                ? 'Removed from favorites'
                : 'Added to Favorites',
        };
    } catch (e) {
        return renderError(e);
    }
};

export const fetchFavorites = async () => {
    const user = await getAuthUser();
    const favourites = await db.favorite.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            property: {
                select: {
                    id: true,
                    name: true,
                    tagline: true,
                    country: true,
                    price: true,
                    image: true,
                },
            },
        },
    });
    return favourites.map((f) => f.property);
};

export const fetchPropertyDetails = async (id: string) => {
    return db.property.findUnique({
        where: {
            id: id,
        },
        include: {
            profile: true,
            bookings: {
                select: {
                    checkIn: true,
                    checkOut: true,
                },
            },
        },
    });
};

export const createReviewAction = async (
    prevState: unknown,
    formData: FormData
) => {
    const user = await getAuthUser();
    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validatedWithZodSchema(
            createReviewSchema,
            rawData
        );
        await db.review.create({
            data: {
                ...validatedFields,
                profileId: user.id,
            },
        });
        revalidatePath(`/properties/${validatedFields.propertyId}`);
        return { message: 'Review submitted successfully.' };
    } catch (e) {
        return renderError(e);
    }
};

export const fetchPropertyReviews = async (propertyId: string) => {
    return db.review.findMany({
        where: {
            propertyId,
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            profile: {
                select: {
                    firstName: true,
                    profileImage: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const fetchPropertyReviewsByUser = async () => {
    const user = await getAuthUser();
    return db.review.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            property: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    });
};

export const deleteReviewAction = async (prev: { reviewId: string }) => {
    const user = await getAuthUser();
    try {
        await db.review.delete({
            where: {
                id: prev.reviewId,
                profileId: user.id,
            },
        });
        revalidatePath('/reviews');
        return { message: 'deleted  review successfully.' };
    } catch (e) {
        return renderError(e);
    }
};

export const fetchPropertyRating = async (propertyId: string) => {
    const result = await db.review.groupBy({
        by: ['propertyId'],
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
        where: {
            propertyId,
        },
    });

    return {
        rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
        count: result[0]?._count.rating ?? 0,
    };
};

export const findExistingReview = async (
    userId: string,
    propertyId: string
) => {
    return db.review.findFirst({
        where: {
            profileId: userId,
            propertyId,
        },
    });
};

export const createBookingAction = async ({
    propertyId,
    checkIn,
    checkOut,
}: {
    propertyId: string;
    checkIn: Date;
    checkOut: Date;
}) => {
    const user = await getAuthUser();
    await db.booking.deleteMany({
        where: {
            profileId: user.id,
            paymentStatus: false,
        },
    });
    let bookingId: string | null = null;
    const property = await db.property.findUnique({
        where: {
            id: propertyId,
        },
        select: {
            price: true,
        },
    });

    if (!property) {
        return { message: 'Property not found' };
    }

    const { orderTotal, totalNights } = calculateTotal({
        checkIn,
        checkOut,
        price: property.price,
    });
    try {
        const booking = await db.booking.create({
            data: {
                checkIn,
                checkOut,
                profileId: user.id,
                propertyId,
                totalNights,
                orderTotal,
            },
        });
        bookingId = booking.id;
    } catch (error) {
        return renderError(error);
    }
    redirect(`/checkout?bookingId=${bookingId}`);
};

export const fetchBookings = async () => {
    const user = await getAuthUser();
    const bookings = await db.booking.findMany({
        where: {
            profileId: user.id,
            paymentStatus: true,
        },
        include: {
            property: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return bookings;
};

export const deleteBookingAction = async (prevState: { bookingId: string }) => {
    const { bookingId } = prevState;
    const user = await getAuthUser();

    try {
        await db.booking.delete({
            where: {
                id: bookingId,
                profileId: user.id,
            },
        });
        revalidatePath('/booking');
        return { message: 'Booking deleted successfully' };
    } catch (error) {
        return renderError(error);
    }
};

export const fetchRentals = async () => {
    const user = await getAuthUser();
    const rentals = await db.property.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            id: true,
            name: true,
            price: true,
        },
    });

    const rentalsWithBookingsSums = await Promise.all(
        rentals.map(async (rental) => {
            const totalNightsSum = await db.booking.aggregate({
                where: {
                    propertyId: rental.id,
                    paymentStatus: true,
                },
                _sum: {
                    totalNights: true,
                },
            });
            const orderTotal = await db.booking.aggregate({
                where: {
                    propertyId: rental.id,
                    paymentStatus: true,
                },
                _sum: {
                    orderTotal: true,
                },
            });

            return {
                ...rental,
                totalNightsSum: totalNightsSum._sum.totalNights,
                orderTotalSum: orderTotal._sum.orderTotal,
            };
        })
    );
    return rentalsWithBookingsSums;
};

export const deleteRentalAction = async (prevState: { propertyId: string }) => {
    const { propertyId } = prevState;
    const user = await getAuthUser();

    try {
        await db.property.delete({
            where: {
                id: propertyId,
                profileId: user.id,
            },
        });
        revalidatePath('/rentals');
        return { message: 'Rental deleted successfully' };
    } catch (error) {
        return renderError(error);
    }
};

export const fetchRentalDetails = async (propertyId: string) => {
    const user = await getAuthUser();
    return await db.property.findUnique({
        where: {
            id: propertyId,
            profileId: user.id,
        },
    });
};

export const updatePropertyAction = async (
    prevState: unknown,
    formData: FormData
) => {
    const user = await getAuthUser();
    const propertyId = formData.get('id') as string;

    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validatedWithZodSchema(propertySchema, rawData);
        await db.property.update({
            where: {
                id: propertyId,
                profileId: user.id,
            },
            data: {
                ...validatedFields,
            },
        });
        revalidatePath(`/rentals/${propertyId}/edit`);
        return { message: 'updated successfully' };
    } catch (error) {
        return renderError(error);
    }
};

export const updatePropertyImageAction = async (
    prevState: unknown,
    formData: FormData
) => {
    const user = await getAuthUser();
    const propertyId = formData.get('id') as string;
    try {
        const image = formData.get('image') as File;

        const validatedFields = validatedWithZodSchema(imageSchema, { image });
        const fullPath = await uploadImage(validatedFields.image);
        await db.property.update({
            where: {
                id: propertyId,
                profileId: user.id,
            },
            data: {
                image: fullPath,
            },
        });
        revalidatePath(`/rentals/${propertyId}/edit`);
        return { message: 'Update property image' };
    } catch (error) {
        return renderError(error);
    }
};

export const fetchReservations = async () => {
    const user = await getAuthUser();

    const reservations = await db.booking.findMany({
        where: {
            paymentStatus: true,
            property: {
                profileId: user.id,
            },
        },

        orderBy: {
            createdAt: 'desc', // or 'asc' for ascending order
        },

        include: {
            property: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    country: true,
                },
            }, // include property details in the result
        },
    });
    return reservations;
};

export const getAdminUser = async () => {
    const user = await getAuthUser();
    if (user.id !== process.env.ADMIN_USER_ID) {
        return redirect('/');
    }

    return user;
};

export const fetchStats = async () => {
    await getAdminUser();

    const usersCount = await db.profile.count();
    const propertiesCount = await db.property.count();
    const bookingsCount = await db.booking.count({
        where: {
            paymentStatus: true,
        },
    });

    return {
        usersCount,
        propertiesCount,
        bookingsCount,
    };
};

export const fetchChartsData = async () => {
    await getAdminUser();
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    const sixMonthsAgo = date;

    const bookings = await db.booking.findMany({
        where: {
            createdAt: {
                gte: sixMonthsAgo,
            },
            paymentStatus: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    let bookingsPerMonth = bookings.reduce((total, current) => {
        const date = formatDate(current.createdAt, true);

        const exsistingEntry = total.find((entry) => entry.date === date);
        if (exsistingEntry) {
            exsistingEntry.count += 1;
        } else {
            total.push({ date, count: 1 });
        }
        return total;
    }, [] as Array<{ date: string; count: number }>);

    return bookingsPerMonth;
};

export const fetchReservationStats = async () => {
    const user = await getAuthUser();
    const properties = await db.property.count({
        where: {
            profileId: user.id,
        },
    });

    const totals = await db.booking.aggregate({
        _sum: {
            orderTotal: true,
            totalNights: true,
        },
        where: {
            property: {
                profileId: user.id,
            },
        },
    });
    return {
        properties,
        nights: totals._sum.totalNights || 0,
        amount: totals._sum.orderTotal || 0,
    };
};
