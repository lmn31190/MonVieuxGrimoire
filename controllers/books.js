import Book from "../models/book.js";
import fs from "fs";

// POST => add new Book
export const addBook = async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    delete bookData._id;
    delete bookData._userId;
    const book = new Book({
      ...bookData,
      imageUrl: `${process.env.URL}/images/optimized_${req.file.filename}`,
      averageRating: bookData.ratings[0].grade,
    });

    await book.save();
    res.status(201).json({ message: "Votre livre a été créé avec succès !" });
  } catch (err) {
    res.status(400).json({ err });
  }
};

// GET => get All Books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(404).json({ err });
  }
};

// GET => get ONE Book
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }
    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ err });
  }
};

// DELETE => Delete Book
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "403: Vous devez être l'auteur" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) {
        return res.status(500).json({ err: err.message });
      }

      try {
        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Livre supprimé !" });
      } catch (err) {
        res.status(400).json({ err: err.message });
      }
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// PUT => Update book
export const updateBook = async (req, res) => {
  try {
    const bookData = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/optimized_${
            req.file.filename
          }`,
        }
      : { ...req.body };

    delete bookData._userId;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: "403: unauthorized request" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    if (req.file) {
      fs.unlink(`images/${filename}`, (err) => {
        if (err) console.log(err);
      });
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookData, _id: req.params.id }
    );
    res.status(200).json({ message: "Objet modifié !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
