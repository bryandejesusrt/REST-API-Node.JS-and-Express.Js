import express from "express";
import fs from "fs/promises"; // Uso de promises en fs para evitar callbacks bloqueantes
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;
const DATA_FILE = "./data.json";

app.use(bodyParser.json());

const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    throw new Error("No se pudo leer el archivo");
  }
};

const writeData = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(DATA_FILE, jsonData, "utf-8");
  } catch (error) {
    console.error("Error al escribir en el archivo:", error);
    throw new Error("No se pudo escribir en el archivo");
  }
};

// Obtener todos los libros
app.get("/books", async (req, res) => {
  try {
    const data = await readData();
    res.json(data.books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un libro por ID
app.get("/books/:id", async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id, 10);
    const book = data.books.find((b) => b.id === id);

    if (!book) return res.status(404).json({ error: "Libro no encontrado" });

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar un nuevo libro
app.post("/books", async (req, res) => {
  try {
    const data = await readData();
    const newBook = { id: data.books.length + 1, ...req.body };
    data.books.push(newBook);

    await writeData(data);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un libro por ID
app.put("/books/:id", async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id, 10);
    const bookIndex = data.books.findIndex((b) => b.id === id);

    if (bookIndex === -1)
      return res.status(404).json({ error: "Libro no encontrado" });

    data.books[bookIndex] = { ...data.books[bookIndex], ...req.body };

    await writeData(data);
    res.json({ message: "Libro actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un libro por ID
app.delete("/books/:id", async (req, res) => {
  try {
    const data = await readData();
    const id = parseInt(req.params.id, 10);
    const newBooks = data.books.filter((b) => b.id !== id);

    if (newBooks.length === data.books.length)
      return res.status(404).json({ error: "Libro no encontrado" });

    await writeData({ books: newBooks });
    res.json({ message: "Libro eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta de bienvenida
app.get("/", (req, res) => {
  res.send(`¡Hola! Bienvenido a mi servidor.</br>
    Para ver los libros, accede a /books</br>
    Para ver un libro en específico, accede a /books/{id}</br>
    Para agregar un nuevo libro, realiza una petición POST a /books</br>
    Para actualizar un libro, realiza una petición PUT a /books/{id}</br>
    Para eliminar un libro, realiza una petición DELETE a /books/{id}`);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`El servidor está escuchando en el puerto ${PORT}`);
});
