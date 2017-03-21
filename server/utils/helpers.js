const helpers = {
  /**
   * Express middleware to determine if the user is logged in
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  loggedIn(req, res, next) {
    if (req.user !== undefined) {
      next();
    } else {
      res.json({ status: 401, redirect: '/admin/login' });
    }
  },
  /**
   * Converts a String to a slug
   * @param {String} str
   * @returns {String}
   */
  slugify(str) {
    return str
      .toLowerCase()
      .replace(/^\s+|\s+$/g, '')   // Trim leading/trailing whitespace
      .replace(/[-\s]+/g, '-')     // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, '')  // Remove disallowed symbols
      .replace(/--+/g, '-');
  },
  /**
   * Reduces an array of objects to one object using the key value pair parameters
   * @param {Array} arr
   * @param {String} key
   * @param {String} value
   * @param {Object} start
   * @returns {Object}
   */
  reduceToObj(arr, key, value, start = {}) {
    return arr
      .reduce((prev, curr) =>
      Object.assign({}, prev, { [curr[key]]: curr[value] }), start);
  },
};

module.exports = helpers;
