import React, { useState } from "react";
import "../assets/styles/Accounts.css";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([
    { id: 1, name: "Cashier_1", expanded: false, notes: "" },
    { id: 2, name: "Cashier_2", expanded: true, notes: "" },
    { id: 3, name: "Cashier_3", expanded: false, notes: "" },
    { id: 4, name: "Cashier_4", expanded: false, notes: "" },
  ]);

  const toggleExpand = (id) => {
    setAccounts(
      accounts.map((acc) =>
        acc.id === id ? { ...acc, expanded: !acc.expanded } : acc
      )
    );
  };

  const moveUp = (index) => {
    if (index === 0) return;
    let newList = [...accounts];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setAccounts(newList);
  };

  const removeAccount = (id) =>
    setAccounts(accounts.filter((acc) => acc.id !== id));

  const addAccount = () => {
    const nextNum = accounts.length + 1;
    setAccounts([
      ...accounts,
      {
        id: nextNum,
        name: `Cashier_${nextNum}`,
        expanded: false,
        notes: "",
      },
    ]);
  };

  return (
    <div className="dashboard">
      <h1 className="accounts-title">Manage Accounts</h1>

      {accounts.map((acc, index) => (
        <div key={acc.id} className="account-box">
          <div className="account-header">
            <input
              className="account-name"
              value={acc.name}
              onChange={(e) =>
                setAccounts(
                  accounts.map((a) =>
                    a.id === acc.id ? { ...a, name: e.target.value } : a
                  )
                )
              }
            />

            <button
              className="icon-btn"
              onClick={() => moveUp(index)}
              title="Move Up"
            >
              ⏶⏶
            </button>

            <button
              className="icon-btn delete-btn"
              onClick={() => removeAccount(acc.id)}
              title="Delete"
            >
              −
            </button>
          </div>

          {acc.expanded && (
            <textarea
              className="notes-area"
              value={acc.notes}
              onChange={(e) =>
                setAccounts(
                  accounts.map((a) =>
                    a.id === acc.id ? { ...a, notes: e.target.value } : a
                  )
                )
              }
            />
          )}

          <button className="expand-btn" onClick={() => toggleExpand(acc.id)}>
            {acc.expanded ? "▲" : "▼"}
          </button>
        </div>
      ))}

      <button className="add-account" onClick={addAccount}>
        ＋
      </button>
    </div>
  );
}
