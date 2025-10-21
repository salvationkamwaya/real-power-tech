export const mockOperator = { id: "op1", email: "admin@realpowertech.com" };

export async function mockSignIn(email, password) {
  await new Promise((r) => setTimeout(r, 700));
  if (email === mockOperator.email && password === "password123") {
    return { user: mockOperator };
  }
  const err = new Error("Invalid email or password. Please try again.");
  err.code = 401;
  throw err;
}

export const mockDashboardStats = {
  stats: {
    totalRevenue: 1250000,
    totalUsersConnected: 342,
    activeLocations: 7,
    activePartners: 4,
  },
  recentTransactions: [
    {
      id: "t1",
      locationName: "Maria's Cafe - Main St",
      packageName: "1-Hour Access",
      amount: 1000,
      timestamp: new Date().toISOString(),
    },
    {
      id: "t2",
      locationName: "Harbor Mall Food Court",
      packageName: "24-Hour Pass",
      amount: 5000,
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ],
};

export const mockPartners = [
  {
    id: "p1",
    firstName: "Maria",
    lastName: "Kida",
    email: "maria@example.com",
    revenueSharePercentage: 40,
    locationsCount: 1,
  },
  {
    id: "p2",
    firstName: "Juma",
    lastName: "Said",
    email: "juma@example.com",
    revenueSharePercentage: 35,
    locationsCount: 2,
  },
];

export const mockLocations = [
  {
    id: "loc1",
    name: "Maria's Cafe - Main St",
    routerModel: "MikroTik hAP ax²",
    routerIdentifier: "AA:BB:CC:DD:EE:01",
    status: "Active",
    partner: { id: "p1", name: "Maria Kida" },
  },
  {
    id: "loc2",
    name: "Harbor Mall Food Court",
    routerModel: "MikroTik hAP ax³",
    routerIdentifier: "AA:BB:CC:DD:EE:02",
    status: "Active",
    partner: { id: "p2", name: "Juma Said" },
  },
];

export const mockServicePackages = [
  { id: "pkg1", name: "1-Hour Access", price: 1000, durationMinutes: 60 },
  { id: "pkg2", name: "24-Hour Pass", price: 5000, durationMinutes: 1440 },
];
