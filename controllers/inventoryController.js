// controllers/inventoryController.js
const pool = require("../db");
const ExcelJS = require("exceljs");

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

exports.getEmployees = async (req, res) => {
  const { group_id } = req.user;

  try {
    const result = await pool.query(
      "SELECT * FROM employees WHERE group_id = $1 AND role = 'employee'",
      [group_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getItems = async (req, res) => {
  const { group_id } = req.user;

  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE group_id = $1 AND allotted_to_employee_id IS NULL",
      [group_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.allotItem = async (req, res) => {
  const { employee_id, serial_no } = req.body;
  const { group_id } = req.user;

  try {
    const emp = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1 AND group_id = $2",
      [employee_id, group_id]
    );
    if (emp.rowCount === 0)
      return res.status(400).json({ message: "Invalid employee or group mismatch" });

    const update = await pool.query(
      "UPDATE items SET allotted_to_employee_id = $1 WHERE serial_no = $2 AND group_id = $3 RETURNING *",
      [employee_id, serial_no, group_id]
    );

    if (update.rowCount === 0)
      return res.status(404).json({ message: "Item not found or already allotted" });

    res.json({ message: "Item allotted", item: update.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.sendNotice = async (req, res) => {
  const { subject, message } = req.body;
  const { employee_id, name, group_id } = req.user;

  try {
    await pool.query(
      "INSERT INTO notices (sender_id, sender_name, group_id, subject, message) VALUES ($1, $2, $3, $4, $5)",
      [employee_id, name, group_id, subject, message]
    );
    res.json({ message: "Notice sent to Group AD" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.downloadExcel = async (req, res) => {
  const { group_id } = req.user;
  const workbook = new ExcelJS.Workbook();
  const employeeSheet = workbook.addWorksheet("Employees");
  const itemSheet = workbook.addWorksheet("Items");

  try {
    const employees = await pool.query(
      "SELECT * FROM employees WHERE group_id = $1",
      [group_id]
    );
    const items = await pool.query(
      "SELECT * FROM items WHERE group_id = $1",
      [group_id]
    );

    if (employees.rows.length > 0)
      employeeSheet.addRow(Object.keys(employees.rows[0]));
    employees.rows.forEach(emp => employeeSheet.addRow(Object.values(emp)));

    if (items.rows.length > 0)
      itemSheet.addRow(Object.keys(items.rows[0]));
    items.rows.forEach(item => itemSheet.addRow(Object.values(item)));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=group_inventory_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// --- REQUEST VIEW ---
exports.getItemRequests = async (req, res) => {
  const { group_id } = req.user;

  if (req.user.role !== "inventory_holder") return res.status(403).send("Access denied");

  try {
    const result = await pool.query(
      "SELECT * FROM item_requests ORDER BY created_at DESC",
    [group_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// --- ITEM REQUEST APPROVAL ---
exports.approveItemRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE item_requests SET status = 'approved' WHERE id = $1", [id]);
    res.json({ message: "Item request approved" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.rejectItemRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE item_requests SET status = 'rejected' WHERE id = $1", [id]);
    res.json({ message: "Item request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
