'use client';

import {usePathname} from "next/navigation";
import FormContainer from "@/components/form/FormContainer";
import {CardSubmitButton} from "@/components/form/Buttons";
import {toggleFavouritesAction} from "@/utils/actions";

type FavoriteToggleFormProps = {
  favoriteId: string | null;
  propertyId: string;
}

const FavoriteToggleForm = ({ favoriteId, propertyId }: FavoriteToggleFormProps) => {
  const pathname = usePathname();
  const toggleAction = toggleFavouritesAction.bind(null, {
    propertyId,
    favoriteId,
    pathname,
  });

  return <FormContainer action={toggleAction}>
    <CardSubmitButton isFavourite={!!favoriteId} />
  </FormContainer>;
};

export default FavoriteToggleForm;
