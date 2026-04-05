const { Router } = require("express");
const {
  getTransactions,
  getTransactionById,
  getSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const {
  createTransactionRules,
  updateTransactionRules,
} = require("../middleware/validators/transactionValidator");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");

const router = Router();

router.use(authenticate);

router.get("/", getTransactions);
router.get("/summary", getSummary);
router.get("/monthly", getMonthlyBreakdown);
router.get("/categories", getCategoryBreakdown);
router.get("/:id", getTransactionById);
router.post("/", createTransactionRules, validate, createTransaction);
router.put("/:id", updateTransactionRules, validate, updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
