/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};

// Get the account in the window object
export const getMetaMaskAccount = async () => {
  const provider = window.ethereum;
  const accounts = await provider?.request({
    method: 'eth_requestAccounts',
  });
  return accounts;
};
