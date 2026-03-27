import { useEffect, useState } from "react";
import API from "../api/axios";

export default function AdminPage({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState({});
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const usersRes = await API.get("/admin/users");
      const statsRes = await API.get("/admin/stats");

      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch {
      setError("Failed to load admin data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateBalance = async (id) => {
    try {
      const balance = Number(editing[id]);

      await API.patch(`/admin/user/${id}`, { balance });

      setEditing((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page-wrap admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-logo">B</div>
          <h2 className="page-title">Admin Panel</h2>
          <p className="admin-sub">Manage users and balances</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-box">
            <p className="stat-label">TOTAL USERS</p>
            <p className="stat-big gold">{stats.totalUsers}</p>
          </div>
          <div className="admin-stat-box">
            <p className="stat-label">TOTAL BALANCE IN SYSTEM</p>
            <p className="stat-big won-color">
              Rs. {Number(stats.totalBalance || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {error && <div className="toast err">{error}</div>}

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="t-head">Name</th>
              <th className="t-head">Email</th>
              <th className="t-head">Balance</th>
              <th className="t-head">Edit Balance</th>
              <th className="t-head" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="t-row">
                <td className="t-cell">{u.name}</td>
                <td className="t-cell muted">{u.email}</td>
                <td className="t-cell gold">Rs. {Number(u.balance || 0).toLocaleString("en-IN")}</td>
                <td className="t-cell">
                  {editing[u._id] !== undefined ? (
                    <input
                      className="inp inline-inp"
                      type="number"
                      value={editing[u._id]}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [u._id]: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <button
                      className="edit-btn"
                      onClick={() =>
                        setEditing((prev) => ({
                          ...prev,
                          [u._id]: u.balance,
                        }))
                      }
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td className="t-cell">
                  {editing[u._id] !== undefined && (
                    <button className="save-btn" onClick={() => updateBalance(u._id)}>
                      Save
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
