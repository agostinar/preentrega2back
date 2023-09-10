const mongoose = require("mongoose");
// Importa la configuración desde el archivo config.json
const config = require('./config.json');

import http from "http";
import express from "express";
import { promises as fs } from "fs";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";

mongoose.connect("mongodb+srv://logan:308630863086@cluster.mongodb.net/ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Dmessages en mongo
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
});

const Message = mongoose.model("Message", messageSchema);

class ProductManager {
  constructor(productsFile) {.
  }

  //metodopara obteer base d datos
  async getAllMessages() {
    return Message.find();
  }

  // guardar nuevo msj en la base
  async addMessage(user, message) {
    const newMessage = new Message({ user, message });
    return newMessage.save();
  }
}

const Manager = new ProductManager("./products.json");

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));

// rutas y logica para handlebars
app.get("/", async (req, res) => {
  const products = Manager.getAllProducts();
  res.render("home", { products });
});

//ruta para vista del chat
app.get("/chat", async (req, res) => {
  const messages = await Manager.getAllMessages();
  res.render("chat", { messages });
});

// WebSocket para la vista en tiempo real
io.on("connection", (socket) => {
  console.log("New WebSocket connection");
  const products = Manager.getAllProducts();
  socket.emit("initialProducts", products);

  // Manejar mensajes de chat en tiempo real
  socket.on("chatMessage", async (data) => {
    const { user, message } = data;
    await Manager.addMessage(user, message);
    const messages = await Manager.getAllMessages();
    io.emit("newMessage", messages);
  });
});

// Resto del código para manejar las solicitudes POST y otros endpoints

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
