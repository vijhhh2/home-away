import { fetchPropertyDetails, findExistingReview } from '@/utils/actions';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import BreadCrumbs from '@/components/properties/BreadCrumbs';
import FavoriteToggleButton from '@/components/card/FavoriteToggleButton';
import ShareButton from '@/components/properties/ShareButton';
import ImageContainer from '@/components/properties/ImageContainer';
import PropertyRating from '@/components/card/PropertyRating';
import PropertyDetails from '@/components/properties/PropertyDetails';
import UserInfo from '@/components/properties/UserInfo';
import { Separator } from '@/components/ui/separator';
import Description from '@/components/properties/Description';
import Amenities from '@/components/properties/Amenities';
import DynamicMap from '@/components/properties/DynamicMap';
import SubmitReview from '@/components/reviews/SubmitReview';
import PropertyReviews from '@/components/reviews/PropertyReviews';
import DynamicBookingWrapper from '@/components/bookings/DynamicBookingWrapper';

const PropertyDetailsPage = async ({ params }: { params: { id: string } }) => {
    const id = (await params).id;
    const property = await fetchPropertyDetails(id);
    if (!property) {
        redirect('/');
    }
    const { baths, beds, bedrooms, guests } = property;
    const details = { baths, beds, bedrooms, guests };
    const firstName = property.profile.firstName;
    const profileImage = property.profile.profileImage;

    const { userId } = await auth();
    const isNotOwner = property.profile.clerkId !== userId;
    const reviewDoesNotExist =
        userId &&
        isNotOwner &&
        !(await findExistingReview(userId, property.id));

    return (
        <section>
            <BreadCrumbs name={property.name} />
            <header className="flex justify-between items-center mt-4">
                <h1 className="text-4xl font-bold capitalize">
                    {property.tagline}
                </h1>
                <div className="flex items-center gap-x-4">
                    <ShareButton
                        propertyId={property.id}
                        name={property.name}
                    />
                    <FavoriteToggleButton propertyId={property.id} />
                </div>
            </header>
            <ImageContainer mainImage={property.image} name={property.name} />
            <section className="lg:grid lg:grid-cols-12 gap-x-12 mt-12">
                <div className="lg:col-span-8">
                    <div className="flex gap-x-4 items-center">
                        <h1 className="text-xl font-bold">{property.name}</h1>
                        <PropertyRating propertyId={property.id} inPage />
                    </div>
                    <PropertyDetails details={details} />
                    <UserInfo profile={{ profileImage, firstName }} />
                    <Separator className="mt-4" />
                    <Description description={property.description} />
                    <Amenities amenities={property.amenities} />
                    <DynamicMap countryCode={property.country} />
                </div>
                <div className="lg:col-span-4 flex flex-col items-center">
                    {/*<BookingCalendar />*/}
                    <DynamicBookingWrapper
                        propertyId={property.id}
                        price={property.price}
                        bookings={property.bookings}
                    />
                </div>
            </section>
            {reviewDoesNotExist && <SubmitReview propertyId={property.id} />}
            <PropertyReviews propertyId={property.id} />
        </section>
    );
};

export default PropertyDetailsPage;
