// controllers/employeeController.js
const pool = require("../db");

exports.getDashboard = async (req, res) => {
  const { employee_id } = req.user;

  try {
    const result = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1",
      [employee_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getItems = async (req, res) => {
  const { employee_id } = req.user;

  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE allotted_to_employee_id = $1",
      [employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.requestItem = async (req, res) => {
  const { employee_id, name, group_id } = req.user;
  const { item_type, justification } = req.body;

  try {
    await pool.query(
      "INSERT INTO item_requests (employee_id, name, group_id, item_type, justification) VALUES ($1, $2, $3, $4, $5)",
      [employee_id, name, group_id, item_type, justification]
    );
    res.json({ message: "Item request sent to Inventory Holder" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.requestDisposal = async (req, res) => {
  const { employee_id, name, group_id } = req.user;
  const { serial_no, reason } = req.body;

  try {
    await pool.query(
      "INSERT INTO disposal_requests (employee_id, name, group_id, serial_no, reason) VALUES ($1, $2, $3, $4, $5)",
      [employee_id, name, group_id, serial_no, reason]
    );
    res.json({ message: "Disposal request sent to Group AD" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
