const Book = require("../models/Book");

exports.createBook = (req, res, next) => {
    delete req.body._id;
    // on crée une nouvelle instance du modèle Book
    const book = new Book({
        ...req.body, //équivalent de title: req.body.title etc
    });
    book.save()
        .then(() => res.status(201).json({ message: "Livre enregistré !" }))
        .catch((error) => res.status(400).json({ error: error }));
};

exports.modifyBook = (req, res, next) => {
    // on modifie un livre déjà existant dans la BDD
    Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Livre supprimé !" }))
        .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    // permet d'afficher le contenu d'un seul livre car on veut que l'id du livre soit le même que le paramètre de requête de l'URL
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    // on affiche tous les livres de la BDD
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};
