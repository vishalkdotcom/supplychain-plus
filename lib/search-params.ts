import { parseAsInteger, parseAsString } from "nuqs/server";

// Shared nuqs parsers for pagination & filters
export const paginationParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(12),
};

export const searchParser = {
  search: parseAsString.withDefault(""),
};

// Page-specific filter parsers
export const supplierPageParsers = {
  ...paginationParsers,
  ...searchParser,
  region: parseAsString.withDefault("all"),
  riskLevel: parseAsString.withDefault("all"),
};

export const casePageParsers = {
  ...paginationParsers,
  ...searchParser,
  supplier: parseAsString.withDefault("all"),
  severity: parseAsString.withDefault("all"),
};

export const surveyPageParsers = {
  ...paginationParsers,
  ...searchParser,
  supplier: parseAsString.withDefault("all"),
};

export const coursePageParsers = {
  ...paginationParsers,
  ...searchParser,
};
