import { supabase } from './supabase';
import { WalletTransaction, MemberWallet } from '../types';

const WALLET_STORAGE_KEY = 'zona_cero_member_wallets_v1';
const TRANSACTIONS_STORAGE_KEY = 'zona_cero_wallet_transactions_v1';
export const DAILY_REWARD_AMOUNT = 5.00;

// Initial sample data for demo mode
const INITIAL_WALLETS: Record<string, number> = {
  'ZC-1001': 45.00,
  'ZC-1002': 60.00,
  'ZC-1003': 15.00,
  'ZC-1004': 25.00,
  'ZC-1005': 80.00,
  'ZC-1006': 10.00,
};

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-101',
    member_id: 'ZC-1001',
    amount: 5.00,
    type: 'checkin_reward',
    description: 'Recompensa por asistencia diaria',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'tx-102',
    member_id: 'ZC-1001',
    amount: -25.00,
    type: 'pos_redemption',
    description: 'Canje en POS (Proteína Whey)',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'tx-103',
    member_id: 'ZC-1002',
    amount: 5.00,
    type: 'checkin_reward',
    description: 'Recompensa por asistencia diaria',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  }
];

export const walletService = {
  // Get all local wallet balances map
  getLocalWallets(): Record<string, number> {
    try {
      const data = localStorage.getItem(WALLET_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(INITIAL_WALLETS));
        return INITIAL_WALLETS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WALLETS;
    }
  },

  // Get all transactions
  getTransactions(memberId?: string): WalletTransaction[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      let list: WalletTransaction[] = data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
      if (!data) {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      }
      if (memberId) {
        return list.filter(t => t.member_id === memberId);
      }
      return list;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  // Get balance for a specific member
  async getBalance(memberId: string): Promise<number> {
    try {
      // If Supabase is configured and reachable
      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        const { data, error } = await supabase
          .from('member_wallets')
          .select('balance')
          .eq('member_id', memberId)
          .single();
        if (!error && data) {
          return Number(data.balance);
        }
      }
    } catch (e) {
      console.warn('Fallback to local wallet store:', e);
    }

    const wallets = this.getLocalWallets();
    return wallets[memberId] !== undefined ? wallets[memberId] : 0.00;
  },

  // Check if member already received check-in reward today
  hasReceivedDailyRewardToday(memberId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const txs = this.getTransactions(memberId);
    return txs.some(t => 
      t.type === 'checkin_reward' && 
      t.created_at.startsWith(today)
    );
  },

  // Process daily check-in reward
  async grantCheckinReward(
    memberId: string, 
    amount: number = DAILY_REWARD_AMOUNT
  ): Promise<{ rewarded: boolean; newBalance: number; message: string }> {
    if (this.hasReceivedDailyRewardToday(memberId)) {
      const currentBalance = await this.getBalance(memberId);
      return {
        rewarded: false,
        newBalance: currentBalance,
        message: 'El miembro ya recibió su recompensa diaria hoy.'
      };
    }

    // Try Supabase RPC if configured
    try {
      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        const { data, error } = await supabase.rpc('increment_wallet_balance', {
          p_member_id: memberId,
          p_amount: amount
        });

        if (!error) {
          await supabase.from('wallet_transactions').insert({
            member_id: memberId,
            amount: amount,
            type: 'checkin_reward',
            description: `Recompensa por asistencia diaria (+ $${amount.toFixed(2)})`
          });
        }
      }
    } catch (e) {
      console.warn('Using local store for checkin reward:', e);
    }

    // Update local store
    const wallets = this.getLocalWallets();
    const current = wallets[memberId] || 0;
    const newBalance = Number((current + amount).toFixed(2));
    wallets[memberId] = newBalance;
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      member_id: memberId,
      amount: amount,
      type: 'checkin_reward',
      description: `Recompensa por asistencia diaria (+ $${amount.toFixed(2)})`,
      created_at: new Date().toISOString()
    };

    const allTxs = [newTx, ...this.getTransactions()];
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(allTxs));

    window.dispatchEvent(new CustomEvent('zona_cero_wallet_updated', {
      detail: { memberId, balance: newBalance, transaction: newTx }
    }));

    return {
      rewarded: true,
      newBalance,
      message: `¡Recompensa diaria de $${amount.toFixed(2)} acreditada exitosamente!`
    };
  },

  // Redeem wallet balance in POS
  async redeemWallet(
    memberId: string, 
    amountToRedeem: number, 
    orderDescription: string = 'Canje de saldo en Punto de Venta'
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const currentBalance = await this.getBalance(memberId);
    
    if (amountToRedeem <= 0) {
      return { success: false, newBalance: currentBalance, error: 'Monto inválido para canje.' };
    }

    if (currentBalance < amountToRedeem) {
      return { 
        success: false, 
        newBalance: currentBalance, 
        error: `Saldo insuficiente. Saldo disponible: $${currentBalance.toFixed(2)}` 
      };
    }

    // Try Supabase RPC
    try {
      if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) {
        const { error } = await supabase.rpc('increment_wallet_balance', {
          p_member_id: memberId,
          p_amount: -amountToRedeem
        });

        if (!error) {
          await supabase.from('wallet_transactions').insert({
            member_id: memberId,
            amount: -amountToRedeem,
            type: 'pos_redemption',
            description: orderDescription
          });
        }
      }
    } catch (e) {
      console.warn('Using local store for POS redemption:', e);
    }

    // Update local store
    const wallets = this.getLocalWallets();
    const newBalance = Number((currentBalance - amountToRedeem).toFixed(2));
    wallets[memberId] = newBalance;
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      member_id: memberId,
      amount: -amountToRedeem,
      type: 'pos_redemption',
      description: orderDescription,
      created_at: new Date().toISOString()
    };

    const allTxs = [newTx, ...this.getTransactions()];
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(allTxs));

    window.dispatchEvent(new CustomEvent('zona_cero_wallet_updated', {
      detail: { memberId, balance: newBalance, transaction: newTx }
    }));

    return { success: true, newBalance };
  }
};
