import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NONAME } from "dns";

type FormInputProps = {
  name: string;
  type: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
};

const FormInput = ({
  label,
  name,
  type,
  defaultValue,
  placeholder,
}: FormInputProps) => {
  return (
    <div className="mb-2">
      <Label htmlFor={name} className="capitalize">
        {label || NONAME}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default FormInput;
