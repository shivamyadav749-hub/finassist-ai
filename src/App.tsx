import React, { useState, useEffect } from 'react';
import { ActiveTab, FinancialSummary, TransactionItem, UserProfile } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AddTransactionModal } from './components/AddTransactionModal';
import { InfoModal, ModalType } from './components/InfoModal';
import { WelcomeView } from './views/WelcomeView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { AICopilotView } from './views/AICopilotView';
import { InsightsView } from './views/InsightsView';
import { PaymentsView } from './views/PaymentsView';
import { auth, db, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  subscribeUserTransactions,
  addUserTransaction,
  updateUserTransaction,
  deleteUserTransaction,
  calculateFinancialSummary,
} from './lib/transactions';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('finassist_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [summary, setSummary] = useState<FinancialSummary>({
    totalCount: 0,
    settledCount: 0,
    pendingCount: 0,
    flaggedCount: 0,
    settledLiquidity: 412980.0,
    pendingLiquidity: 19410.0,
    totalRevenue: 104850.0,
    totalExpenses: 68320.0,
    netCashFlow: 36530.0,
    estimatedRunwayMonths: 10.8,
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Trigger floating toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Test Firestore connection on boot and listen to authoritative Firebase auth state
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      if (connected) {
        console.log('Cloud Firestore connection verified.');
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocSnap = await getDoc(doc(db, 'users', fbUser.uid));
          const userData = userDocSnap.exists() ? userDocSnap.data() : {};
          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || 'user@workspace.google.com',
            fullName: fbUser.displayName || userData.fullName || 'Enterprise Executive',
            companyName: userData.companyName || 'Institutional Workspace',
            role: userData.role || 'Managing Director',
          };
          setUser(profile);
          localStorage.setItem('finassist_user', JSON.stringify(profile));
        } catch (e) {
          const profile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || 'user@workspace.google.com',
            fullName: fbUser.displayName || 'Enterprise Executive',
            companyName: 'Institutional Workspace',
            role: 'Managing Director',
          };
          setUser(profile);
          localStorage.setItem('finassist_user', JSON.stringify(profile));
        }
      } else {
        setUser(null);
        localStorage.removeItem('finassist_user');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore transactions subscription for the authenticated user
  useEffect(() => {
    if (!user?.id) {
      setTransactions([]);
      return;
    }

    const unsubscribeTxs = subscribeUserTransactions(
      user.id,
      (liveTxs) => {
        setTransactions(liveTxs);
        const computedSummary = calculateFinancialSummary(liveTxs);
        setSummary(computedSummary);
      },
      (err) => {
        console.warn('Firestore subscription warning:', err);
      }
    );

    return () => unsubscribeTxs();
  }, [user?.id]);

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('finassist_user', JSON.stringify(newUser));
    triggerToast(`Welcome back, ${newUser.fullName}! Workspace authenticated.`);
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    localStorage.removeItem('finassist_user');
    setActiveTab('welcome');
    triggerToast('Signed out of FinAssist Workspace.');
  };

  const handleAddTransaction = async (txData: Partial<TransactionItem>) => {
    if (!user?.id) {
      triggerToast('Please sign in to record transactions.');
      return;
    }
    try {
      const added = await addUserTransaction(user.id, txData);
      triggerToast(`Recorded transaction: ${added.counterparty}`);
    } catch (err) {
      console.error('Error posting transaction to Firestore:', err);
      triggerToast('Failed to record transaction to Firestore.');
    }
  };

  const handleUpdateTransactionStatus = async (
    id: string,
    newStatus: 'settled' | 'pending' | 'flagged',
    reason?: string
  ) => {
    if (!user?.id) return;
    try {
      await updateUserTransaction(user.id, id, {
        status: newStatus,
        anomalyReason: reason,
      });
      triggerToast(`Transaction marked as ${newStatus}.`);
    } catch (err) {
      console.error('Error updating transaction in Firestore:', err);
      triggerToast('Failed to update transaction status.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user?.id) return;
    try {
      await deleteUserTransaction(user.id, id);
      triggerToast('Transaction deleted from Firestore.');
    } catch (err) {
      console.error('Error deleting transaction in Firestore:', err);
      triggerToast('Failed to delete transaction.');
    }
  };

  const handleReloadTransactions = async () => {
    triggerToast('Ledger state synchronized with Cloud Firestore.');
  };

  const handleReviewAnomaly = () => {
    setActiveTab('transactions');
    triggerToast('Displaying flagged anomaly items for audit');
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col antialiased selection:bg-[#cad3ff] selection:text-[#0037b0]">
      {/* Global Header */}
      <Header
        currentTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        user={user}
        onSignOut={handleSignOut}
        unreadNotifications={summary.flaggedCount > 0 ? 1 : 0}
        onNotificationClick={handleReviewAnomaly}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pt-16 flex flex-col">
        {activeTab === 'welcome' && (
          <WelcomeView
            onNavigate={(tab) => setActiveTab(tab)}
            onSimulatePayroll={() => setActiveTab('ai-assistant')}
            onOpenInfoModal={(t) => setModalType(t)}
          />
        )}

        {activeTab === 'signin' && (
          <AuthView
            onNavigate={(tab) => setActiveTab(tab)}
            onLoginSuccess={handleLoginSuccess}
            onOpenInfoModal={(t) => setModalType(t)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            summary={summary}
            transactions={transactions}
            onReviewAnomaly={handleReviewAnomaly}
            onReloadTransactions={handleReloadTransactions}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            summary={summary}
            transactions={transactions}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onUpdateStatus={handleUpdateTransactionStatus}
            onDeleteTransaction={handleDeleteTransaction}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AICopilotView onTriggerToast={triggerToast} />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            summary={summary}
            onTriggerToast={triggerToast}
            onOpenInfoModal={(t) => setModalType(t)}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView onTriggerToast={triggerToast} />
        )}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
      />

      {/* Info & Compliance Modals */}
      <InfoModal
        type={modalType}
        onClose={() => setModalType(null)}
        onAction={(msg) => triggerToast(msg)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-[#faf8ff] px-4 py-2.5 rounded-full text-[12px] font-medium shadow-2xl flex items-center gap-2 border border-[#434655]/40 animate-fadeIn pointer-events-none max-w-sm">
          <span className="material-symbols-outlined text-[#85f8c4] text-[18px]">check_circle</span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation Dock (shown on dashboard & inner tools) */}
      {activeTab !== 'welcome' && activeTab !== 'signin' && (
        <BottomNav currentTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />
      )}
    </div>
  );
}
