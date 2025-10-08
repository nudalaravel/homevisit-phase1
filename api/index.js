const express = require("express");
const app = express();

app.use(express.json());

// Mock data
const users = [
  {
    id: 1,
    username: "admin",
    email: "admin@riper.com",
    password: "admin123",
    role: "admin",
    name: "Administrator",
  },
  {
    id: 2,
    username: "user",
    email: "user@riper.com",
    password: "user123",
    role: "user",
    name: "Regular User",
  },
];

const dashboardData = {
  stats: {
    totalUsers: 1250,
    totalOrders: 3420,
    totalRevenue: 125000,
    totalProducts: 89,
  },
  recentOrders: [
    {
      id: 1,
      customer: "John Doe",
      amount: 299.99,
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: 2,
      customer: "Jane Smith",
      amount: 149.5,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: 3,
      customer: "Bob Johnson",
      amount: 89.99,
      status: "shipped",
      date: "2024-01-13",
    },
    {
      id: 4,
      customer: "Alice Brown",
      amount: 199.99,
      status: "completed",
      date: "2024-01-12",
    },
    {
      id: 5,
      customer: "Charlie Wilson",
      amount: 79.99,
      status: "cancelled",
      date: "2024-01-11",
    },
  ],
  chartData: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  },
};

// Auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token: "mock-jwt-token-" + user.id,
      user: userWithoutPassword,
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/user", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token && token.startsWith("mock-jwt-token-")) {
    const userId = parseInt(token.replace("mock-jwt-token-", ""));
    const user = users.find((u) => u.id === userId);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } else {
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    res.status(401).json({ error: "No token provided" });
  }
});

// Dashboard endpoints
app.get("/api/dashboard", (req, res) => {
  res.json(dashboardData);
});

app.get("/api/dashboard/stats", (req, res) => {
  res.json(dashboardData.stats);
});

app.get("/api/dashboard/orders", (req, res) => {
  res.json(dashboardData.recentOrders);
});

app.get("/api/dashboard/chart", (req, res) => {
  res.json(dashboardData.chartData);
});

module.exports = app;

