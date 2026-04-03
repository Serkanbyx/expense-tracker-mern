const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const sanitizedErrors = errors.array().map(({ path, msg }) => ({
      field: path,
      message: msg,
    }));

    return res.status(400).json({ errors: sanitizedErrors });
  }

  next();
};

module.exports = validate;
