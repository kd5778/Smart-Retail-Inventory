const auditLogRepository = require('../repositories/auditLog.repository');
class AuditLogService {
  async getLogs(filters, pagination) {
    const [data, total] = await Promise.all([
      auditLogRepository.findAll(filters, pagination),
      auditLogRepository.count(filters)
    ]);
    const limit = parseInt(pagination.limit) || 20;
    const page = parseInt(pagination.page) || 1;
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  async createLog(data) {
    return await auditLogRepository.create(data);
  }
}
module.exports = new AuditLogService();
