import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";

// import { Prisma } from "@prisma/client";
// const name = Prisma.PropertyScalarFieldEnum.price;

type PriceInputProps = {
  defaultValue?: number;
};

const PriceInput = ({ defaultValue = 100 }: PriceInputProps) => {
  const name = "price";
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        Price ($)
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        defaultValue={defaultValue}
        required
      />
    </div>
  );
};

export default PriceInput;
