const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const groupAD = require("../controllers/groupADController");

// All routes protected and only for GroupAD
router.use(auth);
router.get("/dashboard", groupAD.getDashboard);
router.post("/employee", groupAD.addEmployee);
router.delete("/employee/:id", groupAD.removeEmployee);
router.put("/employee/:id", groupAD.transferEmployee);
router.post("/item", groupAD.addItem);
router.put("/item/:ledgerNo", groupAD.transferItem);
router.get("/excel", groupAD.downloadExcel);
//router.get("/requests/items", groupAD.getItemRequests);
router.get("/requests/disposals", groupAD.getDisposalRequests);
//router.post("/requests/items/:id/approve", groupAD.approveItemRequest);
//router.post("/requests/items/:id/reject", groupAD.rejectItemRequest);
router.post("/requests/disposals/:id/approve", groupAD.approveDisposalRequest);
router.post("/requests/disposals/:id/reject", groupAD.rejectDisposalRequest);



module.exports = router;
