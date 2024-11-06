import FormInput from "../../../components/form/FormInput";
import { SubmitButton } from "../../../components/form/Buttons";
import FormContainer from "../../../components/form/FormContainer";
import { createProfileAction } from "../../../utils/actions";

const CreateProfilePage = () => {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">new user</h1>
      <div className="border p-8 rounded-md">
        <FormContainer action={createProfileAction}>
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <FormInput name="firstName" label="First Name" type="text" />
            <FormInput name="lastName" label="Last Name" type="text" />
            <FormInput name="username" label="Username" type="text" />
          </div>
          <SubmitButton text="Create Profile" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
};

export default CreateProfilePage;