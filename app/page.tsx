import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <h1 className="text-3xl">Hi there!</h1>
      <Button variant={"default"} size={"lg"} className="capitalize">
        click me!
      </Button>
    </>
  );
}
