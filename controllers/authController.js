const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.login = async (req, res) => {
  const { employee_id, password, role } = req.body;

  try {
    const userQuery = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1 AND role = $2",
      [employee_id, role]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = userQuery.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        group_id: user.group_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        employee_id: user.employee_id,
        name: user.name,
        designation: user.designation,
        cadre: user.cadre,
        group_id: user.group_id,
        email: user.email,
        mobile_no: user.mobile_no,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
