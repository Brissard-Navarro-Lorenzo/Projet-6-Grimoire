const Book = require("../models/Book");
const fs = require("fs");
const mongoose = require("mongoose");

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    });

    book.save()
        .then(() => {
            res.status(201).json({ message: "Livre enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.modifyBook = (req, res, next) => {
    // on modifie un livre déjà existant dans la BDD
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
          }
        : { ...req.body };
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Not authorized" });
            }
            if (req.file) {
                const nomAncienneImage = book.imageUrl.split("images/")[1];
                fs.unlink(`images/${nomAncienneImage}`, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Ancienne image supprimée !");
                    }
                });
            }

            Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: "Livre modifié!" }))
                .catch((error) => res.status(401).json({ error }));
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: "Not authorized" });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({ message: "Livre supprimé !" });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
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

async function calculerMoyenne(bookId) {
    const resultat = await Book.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(bookId) } },
        { $unwind: "$ratings" },
        {
            $group: {
                _id: "$_id",
                averageRating: { $avg: "$ratings.grade" },
            },
        },
        {
            $project: {
                _id: 1,
                averageRating: { $round: ["$averageRating", 1] },
            },
        },
    ]);
    if (resultat.length > 0) {
        return resultat[0].averageRating;
    } else {
        return 0;
    }
}

exports.ajoutNote = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            const noteExistante = book.ratings.find((note) => note.userId === req.auth.userId);
            if (noteExistante) {
                res.status(400).json({ message: "Not authorized" });
            } else {
                book.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating,
                });
                book.save()
                    .then(async () => {
                        const moyenne = await calculerMoyenne(req.params.id);
                        const livreModif = await Book.findByIdAndUpdate(req.params.id, { averageRating: moyenne }, { new: true });
                        res.status(201).json(livreModif);
                    })
                    .catch((error) => {
                        res.status(400).json({ error });
                    });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

function meilleursLivres() {
    return Book.find().sort({ averageRating: -1, title: 1 }).limit(3);
}

exports.meilleuresMoyennes = (req, res, next) => {
    meilleursLivres()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};
