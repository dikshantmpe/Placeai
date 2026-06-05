require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/problems", require("./routes/problems"));
app.use("/api/resume", require("./routes/resume"));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
app.use("/api/interview", require("./routes/interview"));
app.use("/api/quiz", require("./routes/quiz"));
app.use("/api/company", require("./routes/company"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/daily", require("./routes/daily"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/auth", require("./routes/auth"));