/**
 * Standardized API Response wrapper
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
  }

  /**
   * Send the response via the Express res object
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }

  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static created(res, data, message = 'Created successfully') {
    return res.status(201).json({ success: true, message, data });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({ success: true, message, data, pagination });
  }
}

module.exports = ApiResponse;
