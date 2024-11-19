"use client";

import { useActionState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import { actionFunction } from "../../utils/types";

const initialState = {
  message: "",
};

type FormContainerProps = {
  action: actionFunction;
  children: React.ReactNode;
};

const FormContainer = ({ action, children }: FormContainerProps) => {
  const [state, formAction] = useActionState(action, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        description: state.message,
      });
    }
  }, [state]);

  return <form action={formAction}>{children}</form>;
};

export default FormContainer;
