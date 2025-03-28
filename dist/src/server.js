"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3001;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Falha ao atualizar o registro" });
    }
    res.status(200).send({ message: "Atualizado com susseço" });
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Falha ao remover o registro" });
    }
    res.status(200).send({ message: "Filme removido com sucesso" });
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Erro interno do servidor" });
    }
});
app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});
