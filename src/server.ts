// Import the framework and instantiate it
import Fastify from "fastify";
import { tasksRoutes } from "./routes";
const app = Fastify();

app.register(tasksRoutes);

// Run the server!
try {
  app.listen({ port: 3333 }, () => {
    console.log(` 🌐- Server is running on port:3333`);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
