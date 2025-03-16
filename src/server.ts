// const http = require("http");
// const server = http.createServer((req, res) => {
//   res.setHeader("Content-Type", "text/plain");

//   if (req.url === "/") {
//     res.statusCode = 200;
//     res.end("Home page");
//   } else if (req.url === "/sobre") {
//     res.statusCode = 200;
//     res.end("About page");
//   }
// });
// server.listen(3000, () => {
//   console.log(`Servidor em execução em http://localhost:3000/`);
// });

// import express from "express";

// const port = 3000;
// const app = express();

// app.get("/filmes", (req, res) => {
//   res.send("Listagem de filmes");
// });

// app.listen(port, () => {
//   console.log(`Servidor em execução em http://localhost:${port}`);
// });

import express from "express";
import { PrismaClient } from "@prisma/client";
const port = 3000;
const app = express();
const prisma = new PrismaClient();
app.get("/movies", async (req, res) => {
  const movies = await prisma.movie.findMany();
  res.json(movies);
});
app.listen(port, () => {
  console.log(`Servidor em execução em http://localhost:${port}`);
});
