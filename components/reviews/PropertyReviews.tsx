import React from 'react';
import { fetchPropertyReviews } from '@/utils/actions';
import Title from '@/components/properties/Title';
import ReviewCard from '@/components/reviews/ReviewCard';

const PropertyReviews = async ({ propertyId }: { propertyId: string }) => {
    const reviews = await fetchPropertyReviews(propertyId);
    if (!reviews || !reviews.length) {
        return null;
    }

    return (
        <div className="mt-8">
            <Title text="Review" />
            <div className="grid md:grid-cols-2 gap-8 mt-4">
                {reviews.map((review) => {
                    const { comment, rating } = review;
                    const { firstName, profileImage } = review.profile;
                    const reviewInfo = {
                        comment,
                        name: firstName,
                        rating,
                        image: profileImage,
                    };
                    return (
                        <ReviewCard key={review.id} reviewInfo={reviewInfo} />
                    );
                })}
            </div>
        </div>
    );
};

export default PropertyReviews;
