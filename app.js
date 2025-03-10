const express = require("express");
const mongoose = require("mongoose");
const Book = require("./models/Book");

const app = express();

mongoose
    .connect(
        "mongodb+srv://lorenzobn:MongoDB_grimoire@clustergrimoire.bbpyh.mongodb.net/?retryWrites=true&w=majority&appName=ClusterGrimoire",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
});

app.post("/api/books", (req, res, next) => {
    delete req.body._id;
    // on crée une nouvelle instance du modèle Book
    const book = new Book({
        ...req.body, //équivalent de title: req.body.title etc
    });
    book.save()
        .then(() => res.status(201).json({ message: "Livre enregistré !" }))
        .catch((error) => res.status(400).json({ error: error }));
});

app.put("/api/books/:id", (req, res, next) => {
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(400).json({ error }));
});

app.delete("/api/books/:id", (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Livre supprimé !" }))
        .catch((error) => res.status(400).json({ error }));
});

app.get("/api/books/:id", (req, res, next) => {
    // permet d'afficher le contenu d'un seul livre car on veut que l'id du livre soit le même que le paramètre de requête de l'URL
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }));
});

app.get("/api/books", (req, res, next) => {
    // on affiche tous les livres de la BDD
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
});

module.exports = app;
