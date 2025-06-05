// routes/inventory.js
const express = require("express");
const router = express.Router();
const inventory = require("../controllers/inventoryController");
const auth = require("../middleware/auth");

router.use(auth);
router.get("/dashboard", inventory.getDashboard);
router.get("/employees", inventory.getEmployees);
router.get("/items", inventory.getItems);
router.post("/allot", inventory.allotItem);
router.post("/notice", inventory.sendNotice);
router.get("/excel",  inventory.downloadExcel);
router.get("/requests/items", inventory.getItemRequests);
router.post("/requests/items/:id/approve", inventory.approveItemRequest);
router.post("/requests/items/:id/reject", inventory.rejectItemRequest);

module.exports = router;


/*
http://localhost:3000/api/inventory/dashboard
http://localhost:3000/api/inventory/employees
http://localhost:3000/api/inventory/items
http://localhost:3000/api/inventory/requests/items
http://localhost:3000/api/inventory/requests/items/:id/approve
http://localhost:3000/api/inventory/requests/items/:id/reject
http://localhost:3000/api/inventory/notice
http://localhost:3000/api/inventory/excel
*/
