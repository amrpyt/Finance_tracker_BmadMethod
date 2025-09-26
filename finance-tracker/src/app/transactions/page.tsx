'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { TransactionList } from '@/components/transactions/TransactionList'

export default function TransactionsPage() {
  return (
    <AppLayout 
      title="Transactions" 
      description="View and manage all your financial transactions"
    >
      <TransactionList />
    </AppLayout>
  )
}
