"use client";

import * as React from "react";
import { useView } from "@/components/view-context";
import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export function ViewToggle() {
  const { viewMode, setViewMode, currentSupplierId, setCurrentSupplierId } =
    useView();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const router = useRouter();
  const pathname = usePathname();

  const { data: suppliersRes } = useQuery({
    queryKey: ["suppliers", debouncedSearchQuery],
    queryFn: () => fetchSuppliers({ search: debouncedSearchQuery, perPage: 50 }),
  });

  // We need to keep track of the current supplier if they aren't in the current search results
  const { data: currentSupplierRes } = useQuery({
    queryKey: ["suppliers", currentSupplierId],
    queryFn: () => currentSupplierId ? fetchSuppliers({ search: currentSupplierId, perPage: 1 }) : null,
    enabled: !!currentSupplierId,
  });

  const suppliers = suppliersRes?.data || [];

  const handleBrandSelect = () => {
    setViewMode("brand");
    setCurrentSupplierId(null);
    setOpen(false);
    if (pathname?.startsWith("/suppliers/")) {
      router.push("/");
    }
  };

  const handleSupplierSelect = (supplierId: string) => {
    setViewMode("supplier");
    setCurrentSupplierId(supplierId);
    setOpen(false);
    if (pathname === "/" || pathname === "/suppliers") {
      router.push(`/suppliers/${supplierId}`);
    }
  };

  // Find the current supplier name, either from the current search results or the dedicated fetch
  const currentSupplier =
    suppliers.find((s) => s.id === currentSupplierId) ||
    currentSupplierRes?.data?.find((s) => s.id === currentSupplierId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between h-9 px-3"
        >
          {viewMode === "brand" ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <IconBuildingSkyscraper className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="truncate">Portfolio (All Brands)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              <IconBuilding className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {currentSupplier?.name || "Loading..."}
              </span>
            </div>
          )}
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 shadow-lg" align="end">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search portfolio..." 
            className="h-9" 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Global View">
              <CommandItem
                onSelect={handleBrandSelect}
                className="cursor-pointer"
              >
                <IconBuildingSkyscraper className="mr-2 h-4 w-4 text-indigo-500" />
                <span>Portfolio (All Brands)</span>
                <IconCheck
                  className={cn(
                    "ml-auto h-4 w-4",
                    viewMode === "brand" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            </CommandGroup>
            {suppliers.length > 0 && (
              <CommandGroup heading="Suppliers">
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    onSelect={() => handleSupplierSelect(supplier.id)}
                    className="cursor-pointer"
                  >
                    <IconBuilding className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{supplier.name}</span>
                    <IconCheck
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        viewMode === "supplier" && currentSupplierId === supplier.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
