const pool = require("../db");
const ExcelJS = require("exceljs");

// ✅ GET: Dashboard (all employees and items)

exports.getDashboard = async (req, res) => {
  console.log("🔍 groupAD dashboard accessed by:", req.user);
  if (req.user.role !== "group_ad") {
    console.log("❌ Not GroupAD");
    return res.status(403).send("Access denied");
  }

  try {
    const employees = await pool.query("SELECT * FROM employees ORDER BY group_id, name");
    const items = await pool.query("SELECT * FROM items ORDER BY group_id, type");

    res.json({
      employees: employees.rows,
      items: items.rows,
    });
  } catch (err) {
    console.error("❌ DB error:", err.message);
    res.status(500).send("Server error");
  }
};

exports.addEmployee = async (req, res) => {
  const {
    employee_id, name, designation, cadre, group_id,
    email, mobile_no, role, password_hash
  } = req.body;

  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    const result = await pool.query(
      `INSERT INTO employees (
        employee_id, name, designation, cadre, group_id,
        email, mobile_no, role, password_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [employee_id, name, designation, cadre, group_id,
       email, mobile_no, role, password_hash]
    );
    res.status(201).json({ message: "Employee added" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
exports.removeEmployee = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    await pool.query("DELETE FROM employees WHERE employee_id = $1", [id]);
    res.json({ message: "Employee removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
exports.transferEmployee = async (req, res) => {
  const { id } = req.params;
  const { new_group_id } = req.body;

  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    await pool.query("UPDATE employees SET group_id = $1 WHERE employee_id = $2",
      [new_group_id, id]);

    res.json({ message: "Employee transferred" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
exports.addItem = async (req, res) => {
  const {
    ledger_no, serial_no, type, quantity, cost, group_id
  } = req.body;

  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    await pool.query(
      `INSERT INTO items (
        ledger_no, serial_no, type, quantity, cost, status, group_id
      ) VALUES ($1,$2,$3,$4,$5,'available',$6)`,
      [ledger_no, serial_no, type, quantity, cost, group_id]
    );

    res.status(201).json({ message: "Item added" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
exports.transferItem = async (req, res) => {
  const { ledgerNo } = req.params;
  const { new_group_id } = req.body;

  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    await pool.query("UPDATE items SET group_id = $1 WHERE ledger_no = $2",
      [new_group_id, ledgerNo]);

    res.json({ message: "Item transferred" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
exports.downloadExcel = async (req, res) => {
  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    const employees = await pool.query("SELECT * FROM employees ORDER BY group_id, name");
    const items = await pool.query("SELECT * FROM items ORDER BY group_id, type");

    const workbook = new ExcelJS.Workbook();
    const empSheet = workbook.addWorksheet("Employees");
    const itemSheet = workbook.addWorksheet("Items");

    empSheet.columns = [
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Name", key: "name", width: 20 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Cadre", key: "cadre", width: 10 },
      { header: "Group", key: "group_id", width: 10 },
      { header: "Email", key: "email", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Role", key: "role", width: 15 },
    ];

    itemSheet.columns = [
      { header: "Ledger No", key: "ledger_no", width: 15 },
      { header: "Serial No", key: "serial_no", width: 20 },
      { header: "Type", key: "type", width: 20 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Cost", key: "cost", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Group", key: "group_id", width: 10 },
      { header: "Allotted To", key: "allotted_to", width: 15 },
    ];

    empSheet.addRows(employees.rows);
    itemSheet.addRows(items.rows);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory_data.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error generating Excel file");
  }
};
/*
// --- REQUEST VIEW ---
exports.getItemRequests = async (req, res) => {
  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    const result = await pool.query("SELECT * FROM item_requests ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};*/

exports.getDisposalRequests = async (req, res) => {
  if (req.user.role !== "group_ad") return res.status(403).send("Access denied");

  try {
    const result = await pool.query("SELECT * FROM disposal_requests ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
/*
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
};*/

// --- DISPOSAL REQUEST APPROVAL ---
exports.approveDisposalRequest = async (req, res) => {
  const { id } = req.params;

  try {
    // Get serial number
    const { rows } = await pool.query("SELECT serial_no FROM disposal_requests WHERE id = $1", [id]);
    const serialNo = rows[0]?.serial_no;

    if (!serialNo) return res.status(404).json({ error: "Serial number not found" });

    // Update item status
    await pool.query("UPDATE items SET status = 'disposal-approved' WHERE serial_no = $1", [serialNo]);
    await pool.query("UPDATE disposal_requests SET status = 'approved' WHERE id = $1", [id]);

    res.json({ message: "Disposal request approved and item status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error" );
  }
};

exports.rejectDisposalRequest = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE disposal_requests SET status = 'rejected' WHERE id = $1", [id]);
    res.json({ message: "Disposal request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

