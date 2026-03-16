"use client";

import * as React from "react";
import { useView } from "@/components/view-context";
import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconCheck,
  IconChevronDown,
  IconWorld,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers, fetchBrands } from "@/lib/api";
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

export function ViewToggle() {
  const {
    viewMode,
    setViewMode,
    currentBrandId,
    setCurrentBrandId,
    currentSupplierId,
    setCurrentSupplierId,
  } = useView();
  const [open, setOpen] = React.useState(false);

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetchBrands(),
  });

  const { data: suppliersRes } = useQuery({
    queryKey: ["suppliers", currentBrandId],
    queryFn: () =>
      fetchSuppliers({
        perPage: 50,
        parentCompanyId: currentBrandId || undefined,
      }),
  });

  const suppliers = suppliersRes?.data || [];

  const handlePortfolioSelect = () => {
    setViewMode("portfolio");
    setCurrentBrandId(null);
    setCurrentSupplierId(null);
    setOpen(false);
  };

  const handleBrandSelect = (brandId: string) => {
    setViewMode("brand");
    setCurrentBrandId(brandId);
    setCurrentSupplierId(null);
    setOpen(false);
  };

  const handleSupplierSelect = (supplierId: string) => {
    setViewMode("supplier");
    setCurrentSupplierId(supplierId);
    setOpen(false);
  };

  const currentBrand = brands?.find((b) => b.id === currentBrandId);
  const currentSupplier = suppliers.find((s) => s.id === currentSupplierId);

  const displayLabel = () => {
    if (viewMode === "supplier" && currentSupplier) {
      return (
        <div className="flex items-center gap-2 overflow-hidden">
          <IconBuilding className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{currentSupplier.name}</span>
        </div>
      );
    }
    if (viewMode === "brand" && currentBrand) {
      return (
        <div className="flex items-center gap-2 overflow-hidden">
          <IconBuildingSkyscraper className="h-4 w-4 shrink-0 text-indigo-500" />
          <span className="truncate">{currentBrand.name}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 overflow-hidden">
        <IconWorld className="h-4 w-4 shrink-0 text-indigo-500" />
        <span className="truncate">Portfolio (All Brands)</span>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between h-9 px-3"
        >
          {displayLabel()}
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 shadow-lg" align="end">
        <Command>
          <CommandInput placeholder="Search brands & suppliers..." className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Global View">
              <CommandItem
                onSelect={handlePortfolioSelect}
                className="cursor-pointer"
              >
                <IconWorld className="mr-2 h-4 w-4 text-indigo-500" />
                <span>Portfolio (All Brands)</span>
                <IconCheck
                  className={cn(
                    "ml-auto h-4 w-4",
                    viewMode === "portfolio" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            </CommandGroup>
            {brands && brands.length > 0 && (
              <CommandGroup heading="Brands">
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    onSelect={() => handleBrandSelect(brand.id)}
                    className="cursor-pointer"
                  >
                    <IconBuildingSkyscraper className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className="truncate">{brand.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground mr-2">
                      {brand.supplierCount}
                    </span>
                    <IconCheck
                      className={cn(
                        "h-4 w-4 shrink-0",
                        viewMode === "brand" && currentBrandId === brand.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {suppliers.length > 0 && (
              <CommandGroup heading={currentBrand ? `${currentBrand.name} Suppliers` : "Suppliers"}>
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
