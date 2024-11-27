import {fetchFavorites} from "@/utils/actions";
import EmptyList from "@/components/home/EmptyList";
import PropertiesList from "@/components/home/PropertiesList";

async function FavoritesPage() {
  const favourites = await fetchFavorites();
  if (!favourites.length) {
    return <EmptyList />;
  }
  return  <PropertiesList properties={favourites} />;
}
export default FavoritesPage;
