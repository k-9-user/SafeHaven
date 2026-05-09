import { useState, useCallback } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';

/**
 * Lightweight Solana wallet hook (Phantom-compatible)
 */
export const useSolana = () => {
  const [address, setAddress] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('solana-address') || '';
    }
    return '';
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const connectSolana = useCallback(async () => {
    const solanaProvider = typeof window !== 'undefined' ? /** @type {any} */ (window).solana : undefined;

    if (!solanaProvider) {
      throw new Error('No Solana wallet found (e.g. Phantom)');
    }

    setIsConnecting(true);
    try {
      const resp = await solanaProvider.connect();
      const pub = resp.publicKey.toString();
      setAddress(pub);
      localStorage.setItem('solana-address', pub);
      localStorage.setItem('solana-wallet', 'phantom');
      setIsConnecting(false);
      return pub;
    } catch (error) {
      setIsConnecting(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      const solanaProvider = typeof window !== 'undefined' ? /** @type {any} */ (window).solana : undefined;
      if (solanaProvider) {
        solanaProvider.disconnect();
      }
    } catch (e) {
      // ignore
    }
    setAddress('');
    localStorage.removeItem('solana-address');
    localStorage.removeItem('solana-wallet');
  }, []);

  const signAndSendTransaction = useCallback(async (connection, transaction) => {
    if (!address) throw new Error('Please connect your wallet first');
    setIsSigning(true);
    try {
      const solanaProvider = /** @type {any} */ (window).solana;

      if (!solanaProvider?.signTransaction) {
        throw new Error('Wallet does not support signTransaction');
      }

      // Ensure transaction is a Transaction instance
      let tx = transaction;
      if (!(tx instanceof Transaction)) {
        tx = Transaction.from(transaction); // assume serialized
      }

      const signed = await solanaProvider.signTransaction(tx);
      // Caller is responsible for sending via connection.sendRawTransaction
      setIsSigning(false);
      return signed;
    } catch (error) {
      setIsSigning(false);
      throw error;
    }
  }, [address]);

  return {
    address,
    isConnecting,
    isSigning,
    connectSolana,
    disconnect,
    signAndSendTransaction,
  };
};
