"use client";

import Link from "next/link";
import type { Supplier, Brand } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconMapPin,
  IconMail,
  IconUser,
  IconCalendar,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";
import { getRiskBadgeVariant } from "@/lib/risk-utils";

interface SupplierHeroProps {
  supplier: Supplier;
  parentBrand?: Brand;
}

export function SupplierHero({ supplier, parentBrand }: SupplierHeroProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Main Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{supplier.name}</h1>
              <Badge
                variant={getRiskBadgeVariant(supplier.riskLevel)}
                className="text-xs"
              >
                {supplier.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {parentBrand && (
                <Link
                  href={`/brands/${parentBrand.id}`}
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <IconBuildingSkyscraper className="h-4 w-4" />
                  <span>{parentBrand.name}</span>
                </Link>
              )}
              <div className="flex items-center gap-1.5">
                <IconMapPin className="h-4 w-4" />
                <span>
                  {supplier.country}, {supplier.region}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconUsers className="h-4 w-4" />
                <span>{supplier.workerCount.toLocaleString()} workers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar className="h-4 w-4" />
                <span>Last activity: {supplier.lastActivityDate}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-2 text-sm bg-muted/50 rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Primary Contact
            </span>
            <div className="flex items-center gap-2">
              <IconUser className="h-4 w-4 text-muted-foreground" />
              <span>{supplier.contactName}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconMail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${supplier.contactEmail}`}
                className="text-indigo-600 hover:underline"
              >
                {supplier.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
