/**
 * Empty dashboard payloads when DB is unavailable or the query fails client-side.
 * Shapes must match tRPC `admin.dashboard`, `lag.dashboard`, `bedrift.dashboard`.
 */

export type AdminDashboardData = {
  organizationsCount: number;
  sponsorsCount: number;
  totalSponsoredOre: number;
  activeSpleisesCount: number;
  newOrganizationsLast7Days: number;
  emailsSentLast7Days: number;
  ordersPendingTreatment: number;
  recentOrganizations: {
    id: string;
    name: string;
    segment: string | null;
    createdAt: string;
  }[];
  recentOrders: {
    id: string;
    organizationName: string;
    totalOre: number;
    status: string;
    createdAt: string;
    productLabel: string | null;
  }[];
};

export type LagDashboardData = {
  organizationName: string | null;
  sponsorFundsOre: number;
  activeApplications: number;
  productOrdersCount: number;
  unreadResponses: number;
  recentActivity: {
    id: string;
    kind: "match" | "order";
    title: string;
    detail: string;
    occurredAt: string;
  }[];
};

export type BedriftDashboardData = {
  companyName: string | null;
  annualBudgetOre: number | null;
  usedBudgetOre: number;
  newRequestsCount: number;
  activeSponsoratsCount: number;
  supportedOrganizationsCount: number;
  pendingMatches: {
    id: string;
    campaignTitle: string;
    amountOre: number;
    updatedAt: string;
  }[];
};

export const EMPTY_ADMIN_DASHBOARD: AdminDashboardData = {
  organizationsCount: 0,
  sponsorsCount: 0,
  totalSponsoredOre: 0,
  activeSpleisesCount: 0,
  newOrganizationsLast7Days: 0,
  emailsSentLast7Days: 0,
  ordersPendingTreatment: 0,
  recentOrganizations: [],
  recentOrders: [],
};

export const EMPTY_LAG_DASHBOARD: LagDashboardData = {
  organizationName: null,
  sponsorFundsOre: 0,
  activeApplications: 0,
  productOrdersCount: 0,
  unreadResponses: 0,
  recentActivity: [],
};

export const EMPTY_BEDRIFT_DASHBOARD: BedriftDashboardData = {
  companyName: null,
  annualBudgetOre: null,
  usedBudgetOre: 0,
  newRequestsCount: 0,
  activeSponsoratsCount: 0,
  supportedOrganizationsCount: 0,
  pendingMatches: [],
};
