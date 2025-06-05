const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const groupADRoutes = require("./routes/groupad");
const authRoutes = require("./routes/auth");
const inventoryRoutes = require("./routes/inventory");
const employeeRoutes = require("./routes/employee");



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/api/employee", employeeRoutes);
app.use("/api", authRoutes);
  
app.use("/api/inventory", inventoryRoutes);
app.use("/api/groupad", groupADRoutes);

;




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
