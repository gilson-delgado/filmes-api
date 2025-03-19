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
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// pesquisar fimes no banco de dados
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


//Atualizando filmes inclusão de um novo filme
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

    return res.status(201).send({ message: "Filme criado com sucesso!" }); // Retorno aqui
  } catch (error) {
    console.error("Erro capturado:", error);
    return res.status(500).send({ message: "Falha ao cadastrar um filme" });
  }

  res.status(201).send();
});

//Atualizando filmes parte 2 alterações nos dados
app.put("/movies/:id", async (req, res) => {
  console.log(req.params.id);
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
    });
    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    const data = { ...req.body };
    data.release_date = data.release_date
      ? new Date(data.release_date)
      : undefined;

    await prisma.movie.update({ where: { id }, data: data });
  } catch (error) {
    return res.status(500).send({ message: "Falha ao atualizar o registro" });
  }

  res.status(200).send();
});


//remover filmes
app.delete("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    await prisma.movie.delete({ where: { id } });
  } catch (error) {
    res.status(500).send({ message: "Falha ao remover o registro" });
  }
  res.status(200).send();
});

//filtrar filmes por genero
app.get("/movies/:genreName", async (req, res) => {
  console.log(req.params.genreName);
  try {
    const moviesFilteredByGenreName = await prisma.movie.findMany({
      include: {
        genre: true,
        language: true,
      },

      where: {
        genre: {
          name: {
            equals: req.params.genreName,
            mode: "insensitive",
          },
        },
      },
    });
    res.status(200).send(moviesFilteredByGenreName);
  } catch (error) {
    return res.status(500).send({ message: "Falha ao atualizar um filme" });
  }
});



app.listen(port, () => {
  console.log(`Servidor em execução em http://localhost:${port}`);
});
