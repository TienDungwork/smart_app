import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";

// Import routes
import { authRoutes } from "./routes/auth";
import { organizationRoutes } from "./routes/organizations";
import { unitRoutes } from "./routes/units";
import { userRoutes } from "./routes/users";
import { personRoutes } from "./routes/persons";
import { roomRoutes } from "./routes/rooms";
import { cameraRoutes } from "./routes/cameras";
import { sessionRoutes } from "./routes/sessions";
import { attendanceRoutes } from "./routes/attendance";
import { aiEventRoutes } from "./routes/ai-events";
import { reportRoutes } from "./routes/reports";

// Create Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({
    origin: (origin) => {
        if (process.env.NODE_ENV !== 'production') return origin;
        const allowed = [
            'http://localhost:5173',
            'http://localhost:3000',
        ];
    
        if (origin?.includes('.vercel.app')) return origin;
        
        return allowed.includes(origin || '') ? origin : allowed[0];
    },
    credentials: true,
}));

// Static files
app.use("/uploads/*", serveStatic({ root: "./" }));

// Health check
app.get("/api/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/organizations", organizationRoutes);
app.route("/api/units", unitRoutes);
app.route("/api/users", userRoutes);
app.route("/api/persons", personRoutes);
app.route("/api/rooms", roomRoutes);
app.route("/api/cameras", cameraRoutes);
app.route("/api/sessions", sessionRoutes);
app.route("/api/attendance", attendanceRoutes);
app.route("/api/ai-events", aiEventRoutes);
app.route("/api/reports", reportRoutes);

// WebSocket for realtime updates
const server = Bun.serve({
    port: Number(process.env.PORT) || 3005,
    fetch: app.fetch,
    websocket: {
        open(ws) {
            console.log("WebSocket client connected");
        },
        message(ws, message) {
            const data = JSON.parse(message.toString());

            if (data.type === "join-session") {
                ws.subscribe(`session:${data.sessionId}`);
                console.log(`Client joined session:${data.sessionId}`);
            }

            if (data.type === "leave-session") {
                ws.unsubscribe(`session:${data.sessionId}`);
            }
        },
        close(ws) {
            console.log("WebSocket client disconnected");
        },
    },
});

// Export for broadcasting from other modules
export const broadcast = (channel: string, data: any) => {
    server.publish(channel, JSON.stringify(data));
};

console.log(`🚀 Server running on http://localhost:${server.port}`);
console.log(`📡 WebSocket ready for realtime updates`);

// export default app; // Removed: We already call Bun.serve() explicitly above
