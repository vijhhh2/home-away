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
