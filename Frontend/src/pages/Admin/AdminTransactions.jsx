import React, { useEffect, useState } from 'react';
import { transactionService } from '../../services/transactionService';

const AdminTransactions = () => {
  const [tx, setTx] = useState([]);

  useEffect(() => { (async () => { setTx(await transactionService.list()); })(); }, []);

  const refund = async (id) => {
    await transactionService.refund(id);
    setTx(await transactionService.list());
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6">Transactions</h1>
      <div className="bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr><th className="px-6 py-3">ID</th><th>User</th><th>Amount</th><th>Commission</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {tx.map(t => (
              <tr key={t.id} className="border-t"><td className="px-6 py-3">{t.id}</td><td>{t.userId}</td><td>{t.amount}</td><td>{t.commission}</td><td>{t.status}</td><td>{t.status !== 'refunded' && <button onClick={() => refund(t.id)} className="text-sm text-red-600">Refund</button>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;
