import {auth} from "@clerk/nextjs/server";
import {CardSignInButton} from "@/components/form/Buttons";
import {fetchFavouriteId} from "@/utils/actions";
import FavoriteToggleForm from "@/components/card/FavoriteToggleForm";

const FavoriteToggleButton = async ({propertyId}: { propertyId: string }) => {
    const {userId} = await auth();
    if (!userId) {
        return <CardSignInButton/>;
    }
    const favoriteId = await fetchFavouriteId({propertyId});
    return (
        <FavoriteToggleForm favoriteId={favoriteId} propertyId={propertyId}/>
    );
};

export default FavoriteToggleButton;
