import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { engine } from "express-handlebars";
import dotenv from "dotenv";
import passport from "passport";
import jwt from "jsonwebtoken";
import { initializePassport } from "./config/passport.config.js";
import { handlebarsHelpers } from "./utils/handlebarsHelpers.js";
import Product from "./dao/models/Product.js";
import viewsRouter from "./routes/viewsRouter.js";
import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cartRouter.js";
import sessionsRouter from "./routes/sessionsRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_DB_URL;
const JWT_SECRET = process.env.JWT_SECRET || "123456";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

app.engine(
  "handlebars",
  engine({
    helpers: handlebarsHelpers,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

initializePassport();
app.use(passport.initialize());
app.use(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
});

app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/sessions", sessionsRouter);

io.on("connection", (socket) => {
  console.log("Cliente conectado vía WebSocket:", socket.id);

  const enviarProductosActualizados = async () => {
    try {
      const productos = await Product.find().lean();
      io.emit("productosActualizados", productos);
    } catch (error) {
      console.error("Error al obtener productos:", error.stack);
    }
  };

  enviarProductosActualizados();

  socket.on("nuevoProducto", async (producto) => {
    try {
      const nuevo = new Product(producto);
      await nuevo.save();
      io.emit("productoAgregado", nuevo);
    } catch (error) {
      console.error("Error al agregar producto:", error.stack);
    }
  });

  socket.on("eliminarProducto", async (id) => {
    try {
      const eliminado = await Product.findByIdAndDelete(id);
      if (eliminado) {
        io.emit("productoEliminado", id);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error.stack);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
