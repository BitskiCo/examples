import React, { useState, useEffect } from 'react';
import { Bitski, AuthenticationStatus } from 'bitski';
import { ethers } from 'ethers';
import { EthersAdapter } from '@safe-global/protocol-kit';
import Safe from '@safe-global/protocol-kit';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { hexlify } from '@ethersproject/bytes';

const FALLBACK_CONTRACT = '0x0FC7c07622De076007fBCB3652B4C1bAb748456F';
const MANAGER_CONTRACT = '0x767Dd20D76eE07dc53b176fB407709ACb5d7d529';
const ENTRYPOINT_CONTRACT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
const ACCOUNT_FACTORY_CONTRACT = '0xB3C11c903e46af0437Bad5e2cC18c91BF997C548';

const FALLBACK_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "",
        type: "uint8",
      },
    ],
    name: "executeAndRevert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const MANAGER_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "operation",
        type: "uint8",
      },
    ],
    name: "executeAndRevert",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ENTRYPOINT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint192',
        name: 'key',
        type: 'uint192',
      },
    ],
    name: 'getNonce',
    outputs: [
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'callGasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'verificationGasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'paymasterAndData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct UserOperation',
        name: 'userOp',
        type: 'tuple',
      },
    ],
    name: 'getUserOpHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "callGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "verificationGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxFeePerGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxPriorityFeePerGas",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct UserOperation[]",
        name: "ops",
        type: "tuple[]",
      },
      {
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "handleOps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "callGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "verificationGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxFeePerGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxPriorityFeePerGas",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct UserOperation",
        name: "userOp",
        type: "tuple",
      },
    ],
    name: "simulateValidation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ACCOUNT_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "salt",
        "type": "uint256"
      }
    ],
    "name": "getAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "salt",
        type: "uint256",
      },
    ],
    name: "createAccount",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const bitski = new Bitski(
  '1812bcfa-44ab-48e3-87b2-b06de6c8e89d',
  'http://localhost:5173/callback.html',
);

function App() {
  const [currentAccount, setAccount] = useState(null);
  const [currentSafe, setSafe] = useState(null);
  const [accountCurrencyBalance, setAccountCurrencyBalance] = useState(null);
  const [safeCurrencyBalance, setSafeCurrencyBalance] = useState(null);
  const [accountNftBalance, setAccountNftBalance] = useState(null);
  const [safeNftBalance, setSafeNftBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [sendNftHash, setNftHash] = useState(null);
  const [sendTokenHash, setTokenHash] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProvider();
  });

  const getProvider = async () => {
    if (provider) return;

    const web3 = new ethers.providers.Web3Provider(
      bitski.getProvider({
        network: {
          rpcUrl: "https://api.stackup.sh/v1/node/08ab8e470fd139102cb5cc813ad3989e82d5b6831cef278a757cc53f1443a659",
          chainId: 5,
        },
      })
    );
    setProvider(web3);
  };

  const getAccounts = async () => {
    if (!provider) {
      getProvider();
    }

    const accounts = await provider.send('eth_accounts');

    if (accounts.length) {
      return accounts;
    }

    const addressAccounts = await provider.send('eth_requestAccounts');

    if (addressAccounts.length) {
      return addressAccounts;
    }

    setError('Could not find valid accounts');
  };

  const getCurrencyBalances = async (account, safe) => {
    const defaultBalance = {
      balances: [{
        balance: "0",
        chainId: 5,
        coinType: 60,
        contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        imageUrl: "https://assets.ankr.com/charts/icon-only/eth.svg",
        tokenDecimals: 18,
        tokenName: "Goerli Ethereum",
        tokenStandard: "NATIVE",
        tokenSymbol: "GTH"
      }]
    };
    
    if (!account || !safe) {
      setAccountBalance(defaultBalance);
      setSafeBalance(defaultBalance);
      return;
    }

    const currentAccountBalanceResponse = await fetch(`https://api.bitski.com/v2/balances?address=${account}&chainIds=5`);
    const safeAccountBalanceResponse = await fetch(`https://api.bitski.com/v2/balances?address=${safe}&chainIds=5`);

    if (currentAccountBalanceResponse.ok && safeAccountBalanceResponse.ok) {
      const currentAccountBalanceData = await currentAccountBalanceResponse.json();
      const safeAccountBalanceData = await safeAccountBalanceResponse.json();

      const currentAccountBalance = currentAccountBalanceData.balances ?? defaultBalance;
      const safeAccountBalance = safeAccountBalanceData.balances ?? defaultBalance;

      setAccountCurrencyBalance(currentAccountBalance);
      setSafeCurrencyBalance(safeAccountBalance);
    }
  };

  const getNftBalances = async (account, safe) => {
    const defaultBalance = {
      balances: [{
        balance: "0",
        chainId: 5,
        coinType: 60,
        contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        imageUrl: "https://assets.ankr.com/charts/icon-only/eth.svg",
        tokenDecimals: 18,
        tokenName: "Goerli Ethereum",
        tokenStandard: "NATIVE",
        tokenSymbol: "GTH"
      }]
    };
    
    if (!account || !safe) {
      setAccountBalance(defaultBalance);
      setSafeBalance(defaultBalance);
      return;
    }

    const currentAccountBalanceResponse = await fetch(`https://api.bitski.com/v2/balances?address=${account}&chainIds=5&nfts=true`);
    const safeAccountBalanceResponse = await fetch(`https://api.bitski.com/v2/balances?address=${safe}&chainIds=5&nfts=true`);

    if (currentAccountBalanceResponse.ok && safeAccountBalanceResponse.ok) {
      const currentAccountBalanceData = await currentAccountBalanceResponse.json();
      const safeAccountBalanceData = await safeAccountBalanceResponse.json();

      const currentAccountBalance = currentAccountBalanceData.balances ?? defaultBalance;
      const safeAccountBalance = safeAccountBalanceData.balances ?? defaultBalance;

      setAccountNftBalance(currentAccountBalance);
      setSafeNftBalance(safeAccountBalance);
    }
  };

  const getNft = (balances) => {
    return getBalanceForContractAddress(balances, '0x2e3ef7931f2d0e4a7da3dea950ff3f19269d9063');
  }

  const getErc20 = (balances) => {
    return getBalanceForContractAddress(balances, '0x3f152b63ec5ca5831061b2dccfb29a874c317502');
  }

  const getEthBalance = (balances) => {
    return balances?.find(({ tokenStandard }) => tokenStandard === 'NATIVE')?.balance ?? 0;
  };

  const getBalanceForContractAddress = (balances, tokenAddress) => {
    return balances?.find(({contractAddress }) => contractAddress === tokenAddress);
  }

  const connect = async () => {
    setError(null);

    if (!provider) {
      getProvider();
    }

    const status = await bitski.getAuthStatus();

    if (status !== AuthenticationStatus.Connected) {
      await bitski.signIn();
    }

    const accounts = await getAccounts();

    if (accounts && accounts[0]) {

      const AccountFactoryContract = new Contract(ACCOUNT_FACTORY_CONTRACT, new Interface(ACCOUNT_FACTORY_ABI), provider);
      const safeAccount = await AccountFactoryContract.getAddress(accounts[0], 0);
      
      setAccount(accounts[0]);

      if (safeAccount) {
        setSafe(safeAccount);
        getCurrencyBalances(accounts[0], safeAccount);
        getNftBalances(accounts[0], safeAccount);
      }
    }
  };

  const disconnect = async () => {
    await bitski.signOut();
    setAccount(null);
    setSafe(null);
    setError(null);
  };

  const isDeployed = async (address) => {
    if (!provider) {
      getProvider();
    }
    
    const code = await provider.getCode(address)
    return Promise.resolve(code.length > 2);
  }

  const signUserOp = async (request) => {
    if (!provider) {
      getProvider();
    }

    const safeOwner = provider.getSigner();

    // 1. convert request payload to safe transaction
    // 2. get safe transaction
    // 3. pass to executeAndRevert to get calldata
    // 4. build user op
    // 5. call entrypoint.getUserOpHash with user op
    // 6. call eth_sign with hash
    // 7. attach results of eth_sign to eth_sendUserOperation (userop.signature)
    // 8. optionally validate user op
    // 9. send
    const ERC4337FallbackContract = new Contract(
      FALLBACK_CONTRACT,
      new Interface(FALLBACK_ABI),
      safeOwner,
    );

    const ERC4337ManagerContract = new Contract(
      MANAGER_CONTRACT,
      new Interface(MANAGER_ABI),
      safeOwner,
    );

    const EntrypointContract = new Contract(
      ENTRYPOINT_CONTRACT,
      new Interface(ENTRYPOINT_ABI),
      safeOwner,
    );

    const AccountFactoryContract = new Contract(ACCOUNT_FACTORY_CONTRACT, new Interface(ACCOUNT_FACTORY_ABI), safeOwner);

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner,
    });

    const predictedSafe = {
      safeAccountConfig: {

      },
      safeDeploymentConfig: {
        safeVersion: '1.3.0',
      }
    };

    const safeSdk = await Safe.create({ ethAdapter, predictedSafe });

    const safeTransactionData = {
      to: request.to,
      data: request.data,
      value: request.value,
    };

    const safeTransaction = await safeSdk.createTransaction({
      safeTransactionData,
    });

    const callData = (
      await ERC4337ManagerContract.populateTransaction.executeAndRevert(
        safeTransaction.data.to,
        safeTransaction.data.value,
        safeTransaction.data.data,
        safeTransaction.data.operation,
      )
    ).data;

    const nonce = hexlify(await EntrypointContract.getNonce(currentSafe, 0));

    const initTransaction = await AccountFactoryContract.populateTransaction.createAccount(currentAccount, 0);

    const userOp = {
      preVerificationGas: 2100000,
      maxFeePerGas: 2100000,
      maxPriorityFeePerGas: 2100000,
      paymasterAndData: '0x9406Cc6185a346906296840746125a0E44976454',
      signature: '0x',
      sender: currentAccount,
      nonce,
      callGasLimit: 2100000,
      callData,
      initCode: ACCOUNT_FACTORY_CONTRACT + initTransaction.data?.replace("0x", ""),
      verificationGasLimit: 2100000,
    };

    const userOpHash = await EntrypointContract.getUserOpHash(userOp);

    userOp.signature = await safeOwner.signMessage(ethers.utils.arrayify(userOpHash));

    return userOp;
  };

  const sendUserOp = async (userOp) => {
    if (!provider) {
      getProvider();
    }

    const safeOwner = provider.getSigner();
    
    const EntrypointContract = new Contract(
      ENTRYPOINT_CONTRACT,
      new Interface(ENTRYPOINT_ABI),
      safeOwner,
    );

    // const opsTransaction = await EntrypointContract.handleOps([userOp], '0x9406Cc6185a346906296840746125a0E44976454');
    const opsTransaction = await EntrypointContract.simulateValidation([userOp]);
    const result = await opsTransaction.wait();

    if (result && result.error && result.error.message) {
      throw new Error(result.error.message);
    } else if (result) {
      return result;
    } else {
      throw 'Something went wrong. Please try again.';
    }
  };

  const request = async (request) => {
    const userOp = await signUserOp(request);
    const result = await sendUserOp(userOp);

    return result;
  };

  const sendNftToVault = (nft) => {
    const iface1155 = new Interface([
      {
        name: 'safeTransferFrom',
        inputs: [
          {
            name: 'from',
            type: 'address',
          },
          {
            name: 'to',
            type: 'address',
          },
          {
            name: 'id',
            type: 'uint256',
          },
          {
            name: 'amount',
            type: 'uint256',
          },
          {
            name: 'data',
            type: 'bytes',
          },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ]);

    function create1155TransactionData(
      address,
      recipient,
      quantity,
      balance,
    ) {
      return iface1155.encodeFunctionData('safeTransferFrom', [
        address,
        recipient,
        balance.token.id,
        quantity,
        '0x',
      ]);
    }

    const erc1155TxnData = create1155TransactionData(currentSafe, currentAccount, 1, nft)

    request({
      from: currentSafe,
      to: nft.contractAddress,
      data: erc1155TxnData,
      value: 0,
    });
  };

  const sendTokenToVault = (currency) => {
    const buildTransactionData = () => {
      const abi = [
        {
          name: 'transfer',
          constant: false,
          inputs: [
            {
              name: 'to',
              type: 'address',
            },
            {
              name: 'value',
              type: 'uint256',
            },
          ],
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ];

      const iface = new Interface(abi);

      // send 0.01 value of token
      return iface.encodeFunctionData('transfer', [currentAccount, BigNumber.from('10000000000000000')]);
    };
    
    request({
      to: currency.contractAddress,
      from: currentSafe,
      data: buildTransactionData(),
      value: 0,
    });
  };

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl">Account Abstraction</h1>

      {error && (
        <div className="alert alert-error shadow-lg max-w-xs my-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error} </span>
          </div>
        </div>
      )}

      <section className="flex flex-col items-center justify-center">
        <button
          className="my-4 inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
          onClick={() => (currentAccount ? disconnect() : connect())}
        >
          {currentAccount ? 'Disconnect' : 'Sign In With Bitski'}
        </button>

        <div class="flex flex-col w-full lg:flex-row">
          <div class="grid flex-grow card bg-base-300 rounded-box p-4 max-w-xl">
            {currentAccount ? (
              <div className="break-all">
                <p className="">Bitski Vault</p>
                <p className="mt-2 font-bold">{currentAccount}</p>
                {accountCurrencyBalance && <p className="mt-2 font-bold">Balance: {getEthBalance(accountCurrencyBalance)} ETH</p>}
              </div>
            ) : (
              'Not logged in.'
            )}
          </div> 
          <div class="divider lg:divider-horizontal"></div> 
          <div class="grid flex-grow card bg-base-300 rounded-box p-4 max-w-xl">
            {currentSafe ? (
              <div className="break-all">
                <p className="">Safe {!!isDeployed(currentSafe) ? '(ACTIVE)' : '(INACTIVE)'}</p>
                <p className="mt-2 font-bold">{currentSafe}</p>
                {safeCurrencyBalance && <p className="mt-2 font-bold">Balance: {getEthBalance(safeCurrencyBalance)} ETH</p>}
              </div>
            ) : 'Not logged in.'}
            {currentSafe && safeNftBalance ? <p className="mt-2 font-bold break-all">NFT: {JSON.stringify(getNft(safeNftBalance))}</p> : null}
            {currentSafe && !sendNftHash ? (
              <button
                className="my-4 inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
                onClick={() => sendNftToVault()}
              >
                Send NFT to Vault
              </button>
            ) : null}
            {currentSafe && safeCurrencyBalance ? <p className="mt-2 font-bold break-all">ERC20: {JSON.stringify(getErc20(safeCurrencyBalance))}</p> : null}
            {currentSafe && !sendTokenHash ? (
              <button
                className="mt-4 inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
                onClick={() => sendTokenToVault(getErc20(safeCurrencyBalance))}
              >
                Send ERC20 to Vault
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
