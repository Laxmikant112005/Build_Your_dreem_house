let transactions = [
  { id: 1, userId: 101, engineerId: 201, amount: 120000, commission: 12000, status: 'completed', date: '2026-03-10' },
  { id: 2, userId: 102, engineerId: 202, amount: 50000, commission: 5000, status: 'pending', date: '2026-03-28' }
];

export const transactionService = {
  list: async (filter = {}) => {
    await new Promise(r => setTimeout(r, 300));
    // simple filtering by user or status
    return transactions.filter(t => {
      if (filter.userId && t.userId !== parseInt(filter.userId)) return false;
      if (filter.status && t.status !== filter.status) return false;
      return true;
    });
  },
  refund: async (id) => {
    const tx = transactions.find(t => t.id === parseInt(id));
    if (tx) tx.status = 'refunded';
    return tx;
  }
};
