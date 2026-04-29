import { useEffect, useState } from "react";
import {
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import * as adminService from "../../services/api/admin.service";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: "",
    entity_type: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getAuditLogs(
        pagination.page,
        pagination.limit,
        {
          action: filters.action || undefined,
          entity_type: filters.entity_type || undefined,
        }
      );

      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error("Failed to fetch audit logs:", err);
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("DELETE")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    } else if (action.includes("CREATE")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    } else if (action.includes("UPDATE") || action.includes("FEATURE")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    } else if (action.includes("BLOCK")) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track all admin actions and system activities
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Actions</option>
                <option value="CREATE_CATEGORY">Create Category</option>
                <option value="UPDATE_CATEGORY">Update Category</option>
                <option value="DELETE_CATEGORY">Delete Category</option>
                <option value="DELETE_PRODUCT">Delete Product</option>
                <option value="FEATURE_PRODUCT">Feature Product</option>
                <option value="UNFEATURE_PRODUCT">Unfeature Product</option>
                <option value="ACTIVATE_USER">Activate User</option>
                <option value="BLOCK_USER">Block User</option>
                <option value="BULK_BLOCK_USER">Bulk Block User</option>
                <option value="BULK_DELETE_USER">Bulk Delete User</option>
              </select>

              <select
                value={filters.entity_type}
                onChange={(e) =>
                  setFilters({ ...filters, entity_type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Entity Types</option>
                <option value="user">User</option>
                <option value="product">Product</option>
                <option value="category">Category</option>
              </select>

              <button
                onClick={() => setFilters({ action: "", entity_type: "" })}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {log.user.full_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {log.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            System
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {log.entity_type}
                          </p>
                          {log.entity_id && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {log.entity_id.substring(0, 8)}...
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.details && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {log.details.name && (
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {log.details.name}
                              </p>
                            )}
                            {log.details.email && (
                              <p>
                                <span className="font-medium">Email:</span>{" "}
                                {log.details.email}
                              </p>
                            )}
                            {log.details.slug && (
                              <p>
                                <span className="font-medium">Slug:</span>{" "}
                                {log.details.slug}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} logs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
