"use client";

import { useView } from "@/components/view-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconBuilding, IconBuildingSkyscraper } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSuppliers } from "@/lib/api";

export function ViewToggle() {
  const { viewMode, setViewMode, currentSupplierId, setCurrentSupplierId } =
    useView();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  });

  const handleViewChange = (value: string) => {
    if (value === "brand") {
      setViewMode("brand");
      setCurrentSupplierId(null);
    } else {
      // If switching to supplier view, default to first supplier
      setViewMode("supplier");
      if (!currentSupplierId && suppliers && suppliers.length > 0) {
        setCurrentSupplierId(suppliers[0].id);
      }
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    setCurrentSupplierId(supplierId);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={viewMode} onValueChange={handleViewChange}>
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="brand">
            <div className="flex items-center gap-2">
              <IconBuildingSkyscraper className="h-4 w-4" />
              Brand View
            </div>
          </SelectItem>
          <SelectItem value="supplier">
            <div className="flex items-center gap-2">
              <IconBuilding className="h-4 w-4" />
              Supplier View
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {viewMode === "supplier" && (
        <Select
          value={currentSupplierId || ""}
          onValueChange={handleSupplierChange}
        >
          <SelectTrigger className="w-[200px] h-8 text-sm">
            <SelectValue placeholder="Select supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers?.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
