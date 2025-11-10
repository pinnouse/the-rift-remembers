import "dotenv/config";
import fs from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "colyseus";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { MyRoom } from "./rooms/MyRoom";

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
	console.log("Health check requested from:", req.ip);
	return res
		.status(200)
		.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Prefer TSOA-generated routes (RegisterRoutes) when available. If not, fall back to the manual router.
// Load generated TSOA routes - TSOA is the single source of truth.
// This will throw and fail fast if routes are not generated; run `npm run tsoa:routes` to generate them.
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const generated = require("../build/routes");
	if (!generated || typeof generated.RegisterRoutes !== "function") {
		throw new Error(
			"tsoa generated routes not found or invalid. Run `npm run tsoa:routes`.",
		);
	}
	generated.RegisterRoutes(app);
	console.log("Registered tsoa-generated routes");
} catch (err) {
	console.error("Failed to load tsoa-generated routes:", err);
	throw err; // fail fast - tsoa must be used as source of truth
}

// Serve Swagger UI if the generated swagger spec exists
const swaggerPath = path.join(process.cwd(), "build", "swagger.json");
if (fs.existsSync(swaggerPath)) {
	try {
		const swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
		app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
		console.log("Swagger UI available at /docs");
	} catch (err) {
		console.warn("Failed to load swagger.json for /docs", err);
	}
} else {
	console.log(
		"No swagger.json found in build/. Run `npm run tsoa:spec` to generate docs.",
	);
}

const PORT = parseInt(process.env.port || "2567", 10);
const HOSTNAME = process.env.HOSTNAME || "localhost";

const gameServer = new Server({
	server: createServer(app),
	// driver: new RedisDriver(),
	// presence: new RedisPresence(),
});

/**
 * Define your room handlers:
 */
gameServer.define("my_room", MyRoom);
gameServer.listen(PORT, HOSTNAME).then(() => {
	console.log(`Server started, listening on ${HOSTNAME}:${PORT}`);
});
