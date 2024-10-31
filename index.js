const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messagesRoute");
const app = express();
const socket = require("socket.io")
require("dotenv").config();

const corsOptions = {
    origin: "https://snappy-blue.vercel.app",
    credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth", userRoutes)
app.use("/api/messages", messagesRoute)

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection Successfull");
}).catch((err) => {
    console.log(err.message);
});

app.get("/", (req, res) => {
  res.send("Running `Chat App` Server");
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`)
});

const io = socket(server, {
    cors: {
        origin: "https://snappy-blue.vercel.app",
        credentials: true,
    },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});
