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

app.use(express.json());

app.get("/movies", async (_, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
    include: {
      genre: true,
      language: true,
    },
  });
  res.json(movies);
});

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  try {
    const movieWithSameTitle = await prisma.movie.findFirst({
      where: {
        title: { equals: title, mode: "insensitive" }, //letras maiuscula ou munuscula nao vai gravar se ja exixtir o filme com mesmo nome
      },
    });

    if (movieWithSameTitle) {
      return res
        .status(409)
        .json({ message: "Já existe um filme com esse título" });
    }

    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        release_date: new Date(),
      },
    });

    return res.status(201).json({ message: "Filme criado com sucesso!" }); // Retorno aqui
  } catch (error) {
    console.error("Erro capturado:", error);
    return res.status(500).json({ message: "Falha ao cadastrar um filme" });
  }

  res.status(201).send();
});

app.listen(port, () => {
  console.log(`Servidor em execução em http://localhost:${port}`);
});
