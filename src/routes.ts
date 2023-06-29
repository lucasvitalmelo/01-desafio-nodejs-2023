import axios from "axios";
import { randomUUID } from "crypto";
import { FastifyInstance, FastifyRequest } from "fastify";
import jsonServer from "json-server";
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

interface Task {
  id: number;
  title: string;
  discription: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

server.use(middlewares);
server.use(router);

export async function tasksRoutes(app: FastifyInstance) {
  app.post("/tasks", async (request, reply) => {
    const { title, discription } = request.body as Task;

    const newTask = {
      id: randomUUID(),
      title,
      discription,
      completed_at: false,
      created_at: new Date(),
      updated_at: null,
    };

    try {
      const response = await axios.post("http://localhost:3000/tasks", newTask);
      reply.status(201).send(response.data);
    } catch (error) {
      reply.status(500).send("Não foi possível criar uma nova tarefa");
    }
  });

  app.get("/tasks", async (_, reply) => {
    try {
      const response = await axios.get<Task[]>("http://localhost:3000/tasks");
      const tasks = response.data;
      reply.send(tasks);
    } catch (error) {
      reply.status(500).send("Erro ao buscar as tarefas");
    }
  });

  app.get("/tasks/:search", async (request: FastifyRequest, reply) => {
    const { search } = request.params as any;
    try {
      const response = await axios.get<Task[]>("http://localhost:3000/tasks");
      const findTask = response.data.filter((task) => {
        const discription = task.discription.toLowerCase();
        const title = task.title.toLowerCase();
        const formatedSearch = search.toString().toLowerCase();

        if (
          title.includes(formatedSearch) ||
          discription.includes(formatedSearch)
        ) {
          return task;
        }
        throw new Error();
      });
      reply.send(findTask);
    } catch (error) {
      reply.status(400).send(`Nem uma tarefa com: "${search}" foi encontrada`);
    }
  });

  app.put("/tasks/:id", async (request: FastifyRequest, reply) => {
    const { id } = request.params as any;
    const { title, discription } = request.body as Task;
    try {
      const response = await axios.get<Task[]>(
        `http://localhost:3000/tasks/${id}`
      );
      const updated = await axios.put<Task[]>(
        `http://localhost:3000/tasks/${id}`,
        { ...response.data, title, discription }
      );
      reply.send(updated.data);
    } catch (error) {
      reply.status(400).send(`Nem uma tarefa com: "${id}" foi encontrada`);
    }
  });

  app.patch("/tasks/:id/complete", async (request: FastifyRequest, reply) => {
    const { id } = request.params as any;
    console.log(id);
    try {
      const response = await axios.get<Task>(
        `http://localhost:3000/tasks/${id}`
      );
      const completed_at = response.data.completed_at;

      const updated = await axios.patch<Task[]>(
        `http://localhost:3000/tasks/${id}`,
        { ...response.data, completed_at: !completed_at }
      );
      reply.send(updated.data);
    } catch (error) {
      reply.status(400).send(`Nem uma tarefa com: "${id}" foi encontrada`);
    }
  });

  app.delete("/tasks/:id", async (request: FastifyRequest, reply) => {
    const { id } = request.params as any;
    try {
      const response = await axios.delete<Task[]>(
        `http://localhost:3000/tasks/${id}`
      );

      reply.send(response.data);
    } catch (error) {
      reply.status(400).send(`Nem uma tarefa com: "${id}" foi encontrada`);
    }
  });
}
