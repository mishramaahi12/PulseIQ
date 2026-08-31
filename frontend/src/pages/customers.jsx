import { useState } from "react";
import { Users, Plus, Trash2, Mail } from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

function Customers() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya@gmail.com",
      status: "Active",
    },
    {
      id: 3,
      name: "Aman Verma",
      email: "aman@gmail.com",
      status: "Active",
    },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const addCustomer = () => {
    if (!name.trim() || !email.trim()) return;

    setCustomers((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        status: "Active",
      },
    ]);

    setName("");
    setEmail("");
  };

  const deleteCustomer = (id) => {
    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== id)
    );
  };

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">CUSTOMER MANAGEMENT</span>

              <h1>Customers</h1>

              <p>
                Manage and understand the customers connected to your business.
              </p>
            </div>

            <div className="page-heading-stat">
              <Users size={20} />
              <div>
                <strong>{customers.length}</strong>
                <span>Total customers</span>
              </div>
            </div>
          </div>

          <div className="customer-layout">
            <div className="dashboard-card customer-form-card">
              <div className="card-title-row">
                <div className="card-icon blue">
                  <Plus size={19} />
                </div>

                <div>
                  <h2>Add Customer</h2>
                  <p>Add a new customer to your business.</p>
                </div>
              </div>

              <div className="customer-form">
                <div className="input-group">
                  <label>Customer name</label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div className="input-group">
                  <label>Email address</label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@email.com"
                  />
                </div>

                <button
                  className="primary-action-button"
                  onClick={addCustomer}
                >
                  <Plus size={17} />
                  Add Customer
                </button>
              </div>
            </div>

            <div className="dashboard-card customers-list-card">
              <div className="card-title-row">
                <div className="card-icon green">
                  <Users size={19} />
                </div>

                <div>
                  <h2>Customer List</h2>
                  <p>Your current customer database.</p>
                </div>
              </div>

              <div className="customer-table-wrapper">
                <table className="customer-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="customer-name-cell">
                            <div className="customer-avatar">
                              {customer.name.charAt(0)}
                            </div>

                            <strong>{customer.name}</strong>
                          </div>
                        </td>

                        <td>
                          <div className="customer-email">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        </td>

                        <td>
                          <span className="status-badge">
                            <span></span>
                            {customer.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="delete-button"
                            onClick={() => deleteCustomer(customer.id)}
                            title="Delete customer"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {customers.length === 0 && (
                  <div className="empty-customers">
                    <Users size={32} />
                    <h3>No customers yet</h3>
                    <p>Add your first customer using the form above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Customers;