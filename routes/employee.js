const express = require("express");
const router = express.Router();
const employee = require("../controllers/employeeController");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/dashboard", employee.getDashboard);
router.get("/items", employee.getItems);
router.post("/request-item", employee.requestItem);
router.post("/request-disposal", employee.requestDisposal);

module.exports = router;


/*http://localhost:3000/api/employee/dashboard
http://localhost:3000/api/employee/items
http://localhost:3000/api/employee/request-items
http://localhost:3000/api/employee/request-disposal*/