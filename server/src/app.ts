import express, { Request, Response } from "express";
import cors from "cors";
import { registerLab2Routes } from "./lab2.js";
import { registerAuthRoutes } from "./auth.js";
import { registerRequesterRegressionRoutes } from "./requester-regression.js";
import { registerStaffWorkflowRoutes } from "./staff-workflow.js";

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

registerAuthRoutes(app);
registerLab2Routes(app);
registerRequesterRegressionRoutes(app);
registerStaffWorkflowRoutes(app);

export default app;
