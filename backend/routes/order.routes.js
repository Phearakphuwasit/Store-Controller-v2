const router = require("express").Router();
const auth = require("../middleware/auth");
const { createOrder, getUserOrders } = require("../controllers/order.controller");

router.post("/", auth, createOrder);
router.get("/", auth, getUserOrders);

module.exports = router;
