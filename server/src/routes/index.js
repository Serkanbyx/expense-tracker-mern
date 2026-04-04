const { Router } = require("express");
const authRoutes = require("./authRoutes");
const transactionRoutes = require("./transactionRoutes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);

module.exports = router;
