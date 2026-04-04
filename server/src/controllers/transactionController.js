const mongoose = require("mongoose");
const { startOfMonth, endOfMonth, parse } = require("date-fns");
const Transaction = require("../models/Transaction");

const { TRANSACTION_TYPES, CATEGORIES } = Transaction;

const WHITELISTED_FIELDS = ["type", "amount", "category", "description", "date"];
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const pickFields = (source, fields) =>
  fields.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const createTransaction = async (req, res) => {
  try {
    const data = pickFields(req.body, WHITELISTED_FIELDS);
    data.userId = req.user._id;

    const transaction = await Transaction.create(data);

    res.status(201).json(transaction);
  } catch (error) {
    console.error("CreateTransaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    const { month, category, type, page, limit: rawLimit } = req.query;

    if (month) {
      if (!MONTH_REGEX.test(month)) {
        return res
          .status(400)
          .json({ message: "Invalid month format. Use YYYY-MM" });
      }

      const parsedDate = parse(month, "yyyy-MM", new Date());
      filter.date = {
        $gte: startOfMonth(parsedDate),
        $lte: endOfMonth(parsedDate),
      };
    }

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: `Invalid category. Must be one of: ${CATEGORIES.join(", ")}`,
        });
      }
      filter.category = category;
    }

    if (type) {
      if (!TRANSACTION_TYPES.includes(type)) {
        return res.status(400).json({
          message: `Invalid type. Must be one of: ${TRANSACTION_TYPES.join(", ")}`,
        });
      }
      filter.type = type;
    }

    const limit = Math.min(
      Math.max(parseInt(rawLimit, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: transactions,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("GetTransactions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("GetTransactionById error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const updates = pickFields(req.body, WHITELISTED_FIELDS);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("UpdateTransaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("DeleteTransaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSummary = async (req, res) => {
  try {
    const { month } = req.query;

    const matchStage = {
      userId: new mongoose.Types.ObjectId(req.user._id),
    };

    if (month) {
      if (!MONTH_REGEX.test(month)) {
        return res
          .status(400)
          .json({ message: "Invalid month format. Use YYYY-MM" });
      }

      const parsedDate = parse(month, "yyyy-MM", new Date());
      matchStage.date = {
        $gte: startOfMonth(parsedDate),
        $lte: endOfMonth(parsedDate),
      };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const totals = result.reduce(
      (acc, item) => {
        if (item._id === "income") acc.totalIncome = item.total;
        if (item._id === "expense") acc.totalExpense = item.total;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    totals.netBalance = totals.totalIncome - totals.totalExpense;

    res.status(200).json(totals);
  } catch (error) {
    console.error("GetSummary error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMonthlyBreakdown = async (req, res) => {
  try {
    const { type, year } = req.query;

    const matchStage = {
      userId: new mongoose.Types.ObjectId(req.user._id),
    };

    if (type) {
      if (!TRANSACTION_TYPES.includes(type)) {
        return res.status(400).json({
          message: `Invalid type. Must be one of: ${TRANSACTION_TYPES.join(", ")}`,
        });
      }
      matchStage.type = type;
    }

    if (year) {
      const parsedYear = parseInt(year, 10);

      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return res
          .status(400)
          .json({ message: "Invalid year. Must be between 2000 and 2100" });
      }

      matchStage.date = {
        $gte: new Date(`${parsedYear}-01-01`),
        $lte: new Date(`${parsedYear}-12-31T23:59:59.999Z`),
      };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          type: "$_id.type",
          total: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("GetMonthlyBreakdown error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const { type, month } = req.query;

    const matchStage = {
      userId: new mongoose.Types.ObjectId(req.user._id),
    };

    if (type) {
      if (!TRANSACTION_TYPES.includes(type)) {
        return res.status(400).json({
          message: `Invalid type. Must be one of: ${TRANSACTION_TYPES.join(", ")}`,
        });
      }
      matchStage.type = type;
    }

    if (month) {
      if (!MONTH_REGEX.test(month)) {
        return res
          .status(400)
          .json({ message: "Invalid month format. Use YYYY-MM" });
      }

      const parsedDate = parse(month, "yyyy-MM", new Date());
      matchStage.date = {
        $gte: startOfMonth(parsedDate),
        $lte: endOfMonth(parsedDate),
      };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("GetCategoryBreakdown error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
};
