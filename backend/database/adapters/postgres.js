/**
 * PostgreSQL Adapter (Placeholder)
 *
 * This adapter outlines the interface required by the database abstraction
 * layer but does not include a production implementation. Users who wish
 * to connect PortalAR to PostgreSQL should replace the methods below with
 * actual queries using the `pg` library or a preferred ORM.
 */

function notImplemented() {
  throw new Error('PostgreSQL adapter is not implemented. Set DATABASE_TYPE=sqlite or provide a custom implementation.');
}

module.exports = {
  async initialize() {
    notImplemented();
  },
  async close() {
    // Nothing to close in placeholder implementation
  },
  async getContent() {
    notImplemented();
  },
  async setContent() {
    notImplemented();
  },
  async deleteContent() {
    notImplemented();
  },
  async listAllContent() {
    notImplemented();
  },
  async recordAnalyticsEvent() {
    notImplemented();
  },
  async getAnalytics() {
    notImplemented();
  },
  async getAnalyticsSummary() {
    notImplemented();
  },
  async getAllAnalyticsSummaries() {
    notImplemented();
  },
};
