import express from "express";

import {
  addBook,
  addRating,
  deleteBook,
  getBook,
  getBooks,
  updateBook,
  bestRate,
} from "../controllers/books.js";
import upload, { resizeImage } from "../middleware/upload.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getBooks); //All Books
router.get('/bestrating', bestRate); // bestrate
router.get("/:id", getBook); //One Book
router.post("/", upload, resizeImage, addBook); // Create
router.delete("/:id", authMiddleware, deleteBook); // Delete
router.put("/:id", authMiddleware, upload, resizeImage, updateBook); // Update
router.post('/:id/rating', authMiddleware, addRating); // add Rate

export default router;
