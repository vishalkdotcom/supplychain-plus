"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { IconSearch, IconX, IconLoader } from "@tabler/icons-react";
import { useQueryState, parseAsInteger } from "nuqs";

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Search..." }: SearchInputProps) {
  const [searchParam, setSearchParam] = useQueryState("search", {
    defaultValue: "",
  });
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const formRef = useRef<HTMLFormElement>(null);

  const [, submitAction, isPending] = useActionState(
    async (_previousState: null, formData: FormData) => {
      const query = formData.get("query")?.toString() || "";
      await Promise.all([setSearchParam(query), setPage(1)]);
      return null;
    },
    null
  );

  const handleClear = () => {
    if (formRef.current) {
      const input = formRef.current.elements.namedItem(
        "query"
      ) as HTMLInputElement;
      if (input) {
        input.value = "";
      }
      formRef.current.requestSubmit();
    }
  };

  return (
    <form ref={formRef} action={submitAction} className="relative flex-1">
      {isPending ? (
        <IconLoader className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        name="query"
        placeholder={placeholder}
        defaultValue={searchParam}
        className="pl-9 pr-9"
      />
      {searchParam && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
