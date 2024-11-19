import CategoriesList from "../components/home/CategoriesList";
import PropertiesContainer from "../components/home/PropertiesContainer";

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const { category, search } = await searchParams;
  return (
    <section>
      <CategoriesList category={category} search={search} />
      <PropertiesContainer category={category} search={search} />
    </section>
  );
}
