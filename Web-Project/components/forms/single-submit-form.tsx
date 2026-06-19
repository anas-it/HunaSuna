"use client";

import {
  createContext,
  type FormHTMLAttributes,
  useContext,
  useRef,
  useState
} from "react";

type ServerFormAction = (formData: FormData) => void | Promise<void>;

type SingleSubmitFormProps = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "action"
> & {
  action?: string | ServerFormAction;
};
type SingleSubmitEvent = Parameters<
  NonNullable<FormHTMLAttributes<HTMLFormElement>["onSubmit"]>
>[0];

const SingleSubmitContext = createContext(false);

export function useSingleSubmitStatus() {
  return useContext(SingleSubmitContext);
}

export function SingleSubmitForm({
  action,
  children,
  onSubmit,
  ...props
}: SingleSubmitFormProps) {
  const submittedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: SingleSubmitEvent) {
    if (submittedRef.current) {
      event.preventDefault();
      return;
    }

    onSubmit?.(event);

    if (event.defaultPrevented) {
      return;
    }

    submittedRef.current = true;
    setIsSubmitting(true);
  }

  return (
    <SingleSubmitContext.Provider value={isSubmitting}>
      <form action={action} onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    </SingleSubmitContext.Provider>
  );
}
