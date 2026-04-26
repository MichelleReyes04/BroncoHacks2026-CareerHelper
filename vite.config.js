import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import careerHandler from "./api/career.js";

function careerApiMiddleware() {
  return {
    name: "career-api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/career", async (req, res) => {
        let rawBody = "";

        req.on("data", (chunk) => {
          rawBody += chunk;
        });

        req.on("end", async () => {
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }

          const response = {
            statusCode: 200,
            setHeader(name, value) {
              res.setHeader(name, value);
            },
            status(code) {
              this.statusCode = code;
              res.statusCode = code;
              return this;
            },
            json(payload) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(payload));
            }
          };

          await careerHandler(req, response);
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), careerApiMiddleware()]
});
