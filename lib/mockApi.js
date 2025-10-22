// Mock API removed. Phase 2 now uses real API endpoints.
// Any lingering imports should be removed. Temporary fallbacks below to avoid runtime errors during transition.

export const mockOperator = undefined;
export async function mockSignIn() {
  throw new Error("mockSignIn removed. Use NextAuth signIn instead.");
}
export const mockDashboardStats = undefined;
export const mockPartners = [];
export const mockLocations = [];
export const mockServicePackages = [];
