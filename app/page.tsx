import CategoriesList from "../components/home/CategoriesList";
import PropertiesContainer from "../components/home/PropertiesContainer";
import {Suspense} from "react";
import LoadingCard from "@/components/card/LoadingCard";

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const { category, search } = await searchParams;
  return (
    <section>
      <CategoriesList category={category} search={search} />
        <Suspense fallback={<LoadingCard />}>
            <PropertiesContainer category={category} search={search} />
        </Suspense>
    </section>
  );
}
