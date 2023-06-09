import React, { useState, useEffect } from "react";
import { Bitski, AuthenticationStatus } from "bitski";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { Interface } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify } from "@ethersproject/bytes";
import {
  SimpleAccount,
  SimpleAccount__factory,
  SimpleAccountFactory,
  SimpleAccountFactory__factory,
} from "@account-abstraction/contracts";

const ENTRYPOINT_CONTRACT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const ACCOUNT_FACTORY_CONTRACT = "0x9406Cc6185a346906296840746125a0E44976454";

const ENTRYPOINT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint192",
        name: "key",
        type: "uint192",
      },
    ],
    name: "getNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
    name: "getUserOpHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
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

const ACCOUNT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "dest",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "func",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ACCOUNT_FACTORY_ABI = [
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
        internalType: "contract SimpleAccount",
        name: "ret",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
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
    name: "getAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const CHAIN_ID = 80001;
const BUNDLER_RPC =
  "https://polygon-mumbai.g.alchemy.com/v2/C2-OfbqsQLjG2pRlnJ0uHDqoj07NHwPs";

const ERC_20_CONTRACT_ADDRESS = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";
const ERC_1155_CONTRACT_ADDRESS = "0xA07e45A987F19E25176c877d98388878622623FA";

const bitski = new Bitski(
  "1812bcfa-44ab-48e3-87b2-b06de6c8e89d",
  "http://localhost:5173/callback.html"
);

const alchemyProvider = new ethers.providers.JsonRpcProvider(BUNDLER_RPC);
const stackupBundlerProvider = new ethers.providers.JsonRpcProvider(
  "https://api.stackup.sh/v1/node/a9c136bce80dd619f4bea291f8c56aef127b74f7758c1e4cb6c1ef8339600925"
);
const stackupPaymasterProvider = new ethers.providers.JsonRpcProvider(
  "https://api.stackup.sh/v1/paymaster/a9c136bce80dd619f4bea291f8c56aef127b74f7758c1e4cb6c1ef8339600925"
);

function SimpleExample({ goBack }) {
  const [currentAccount, setAccount] = useState(null);
  const [currentSimpleAccount, setSimpleAccount] = useState(null);
  const [accountCurrencyBalance, setAccountCurrencyBalance] = useState(null);
  const [simpleAccountCurrencyBalance, setSimpleAccountCurrencyBalance] =
    useState(null);
  const [accountNftBalance, setAccountNftBalance] = useState(null);
  const [simpleAccountNftBalance, setSimpleAccountNftBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [sendNftHash, setNftHash] = useState(null);
  const [sendTokenHash, setTokenHash] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProvider();
  });

  const getProvider = async () => {
    if (provider && provider?._network?.chainId !== CHAIN_ID) return;

    const web3 = new ethers.providers.Web3Provider(
      bitski.getProvider({
        network: {
          rpcUrl: `https://api.bitski.com/v1/web3/${CHAIN_ID}`,
          chainId: CHAIN_ID,
        },
      })
    );
    setProvider(web3);
  };

  const getAccounts = async () => {
    if (!provider) {
      getProvider();
    }

    const accounts = await provider.send("eth_accounts");

    if (accounts.length) {
      return accounts;
    }

    const addressAccounts = await provider.send("eth_requestAccounts");

    if (addressAccounts.length) {
      return addressAccounts;
    }

    setError("Could not find valid accounts");
  };

  const getCurrencyBalances = async (account, simpleAccount) => {
    const defaultBalance = {
      balances: [
        {
          balance: "0",
          chainId: CHAIN_ID,
          coinType: 60,
          contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          imageUrl: "https://assets.ankr.com/charts/icon-only/eth.svg",
          tokenDecimals: 18,
          tokenName: "Goerli Ethereum",
          tokenStandard: "NATIVE",
          tokenSymbol: "GTH",
        },
      ],
    };

    if (!account || !simpleAccount) {
      setAccountBalance(defaultBalance);
      setSimpleAccountBalance(defaultBalance);
      return;
    }

    const currentAccountBalanceResponse = await fetch(
      `https://api.bitski.com/v2/balances?address=${account}&chainIds=${CHAIN_ID}`
    );
    const simpleAccountBalanceResponse = await fetch(
      `https://api.bitski.com/v2/balances?address=${simpleAccount}&chainIds=${CHAIN_ID}`
    );

    if (currentAccountBalanceResponse.ok && simpleAccountBalanceResponse.ok) {
      const currentAccountBalanceData =
        await currentAccountBalanceResponse.json();
      const simpleAccountBalanceData =
        await simpleAccountBalanceResponse.json();

      const currentAccountBalance =
        currentAccountBalanceData.balances ?? defaultBalance;
      const simpleAccountBalance =
        simpleAccountBalanceData.balances ?? defaultBalance;

      setAccountCurrencyBalance(currentAccountBalance);
      setSimpleAccountCurrencyBalance(simpleAccountBalance);
    }
  };

  const getNftBalances = async (account, simpleAccount) => {
    const defaultBalance = {
      balances: [
        {
          balance: "0",
          chainId: CHAIN_ID,
          coinType: 60,
          contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          imageUrl: "https://assets.ankr.com/charts/icon-only/eth.svg",
          tokenDecimals: 18,
          tokenName: "Goerli Ethereum",
          tokenStandard: "NATIVE",
          tokenSymbol: "GTH",
        },
      ],
    };

    if (!account || !simpleAccount) {
      setAccountBalance(defaultBalance);
      setSimpleAccountBalance(defaultBalance);
      return;
    }

    const currentAccountBalanceResponse = await fetch(
      `https://api.bitski.com/v2/balances?address=${account}&chainIds=${CHAIN_ID}&nfts=true`
    );
    const simpleAccountBalanceResponse = await fetch(
      `https://api.bitski.com/v2/balances?address=${simpleAccount}&chainIds=${CHAIN_ID}&nfts=true`
    );

    if (currentAccountBalanceResponse.ok && simpleAccountBalanceResponse.ok) {
      const currentAccountBalanceData =
        await currentAccountBalanceResponse.json();
      const simpleAccountBalanceData =
        await simpleAccountBalanceResponse.json();

      const currentAccountBalance =
        currentAccountBalanceData.balances ?? defaultBalance;
      const simpleAccountBalance =
        simpleAccountBalanceData.balances ?? defaultBalance;

      setAccountNftBalance(currentAccountBalance);
      setSimpleAccountNftBalance(simpleAccountBalance);
    }
  };

  const getNft = (balances) => {
    return getBalanceForContractAddress(balances, ERC_1155_CONTRACT_ADDRESS);
  };

  const getErc20 = (balances) => {
    return getBalanceForContractAddress(balances, ERC_20_CONTRACT_ADDRESS);
  };

  const getMaticBalance = (balances) => {
    return (
      balances?.find(({ tokenStandard }) => tokenStandard === "NATIVE")
        ?.balance ?? 0
    );
  };

  const getBalanceForContractAddress = (balances, tokenAddress) => {
    return balances?.find(
      ({ contractAddress }) => contractAddress === tokenAddress
    );
  };

  const connect = async () => {
    setError(null);

    if (!provider || provider?._network?.chainId !== CHAIN_ID) {
      getProvider();
    }

    const status = await bitski.getAuthStatus();

    if (status !== AuthenticationStatus.Connected) {
      await bitski.signIn();
    }

    const accounts = await getAccounts();

    if (accounts && accounts[0]) {
      const AccountFactoryContract = new Contract(
        ACCOUNT_FACTORY_CONTRACT,
        new Interface(ACCOUNT_FACTORY_ABI),
        provider
      );
      const simpleAccount = await AccountFactoryContract.getAddress(
        accounts[0],
        0
      );

      setAccount(accounts[0]);

      if (simpleAccount) {
        setSimpleAccount(simpleAccount);
        getCurrencyBalances(accounts[0], simpleAccount);
        getNftBalances(accounts[0], simpleAccount);
      }
    }
  };

  const disconnect = async () => {
    await bitski.signOut();
    setAccount(null);
    setSimpleAccount(null);
    setError(null);
  };

  const isDeployed = async (address) => {
    if (!provider) {
      getProvider();
    }

    const code = await provider.getCode(address);
    return code.length > 2;
  };

  const estimateUserOpGas = async (userOp) => {
    // const gasData = await stackupBundlerProvider.send(
    //   "eth_estimateUserOperationGas",
    //   [userOp, ENTRYPOINT_CONTRACT]
    // );
    const gasData = await alchemyProvider.send("eth_estimateUserOperationGas", [
      userOp,
      ENTRYPOINT_CONTRACT,
    ]);

    return gasData;
  };

  const signUserOp = async (request) => {
    if (!provider) {
      getProvider();
    }

    const simpleAccountOwner = provider.getSigner();

    const EntrypointContract = new Contract(
      ENTRYPOINT_CONTRACT,
      new Interface(ENTRYPOINT_ABI),
      simpleAccountOwner
    );

    const AccountFactoryContract = new Contract(
      ACCOUNT_FACTORY_CONTRACT,
      new Interface(ACCOUNT_FACTORY_ABI),
      simpleAccountOwner
    );

    const SimpleAccountContract = new Contract(
      currentSimpleAccount,
      new Interface(ACCOUNT_ABI),
      simpleAccountOwner
    );

    const simpleAccount = SimpleAccount__factory.connect(
      currentSimpleAccount,
      simpleAccountOwner
    );

    const callData = simpleAccount.interface.encodeFunctionData("execute", [
      request.to,
      request.value,
      request.data,
    ]);

    const nonce = hexlify(
      await EntrypointContract.getNonce(currentSimpleAccount, 0)
    );

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await alchemyProvider.getFeeData();

    const userOp = {
      sender: currentSimpleAccount,
      nonce,
      initCode: "0x",
      callData,
      // callGasLimit: "0x",
      // verificationGasLimit: "0x",
      // preVerificationGas: "0x",
      maxFeePerGas: "0x0",
      maxPriorityFeePerGas: "0x0",
      paymasterAndData: "0x",
      signature:
        "0xaecc72634f6c02bc10ec820d21f6ae77cfa16f970b9ae2172133c4f445db47e559a347766e448f5ded21ce41fc2ca92490ee32db75df7508309c65604f4a73af1b",
    };

    const gasData = await estimateUserOpGas(userOp);

    userOp.verificationGasLimit = gasData.verificationGasLimit;
    userOp.preVerificationGas = gasData.preVerificationGas;
    userOp.callGasLimit = gasData.callGasLimit;

    userOp.maxFeePerGas = hexlify(maxFeePerGas);
    userOp.maxPriorityFeePerGas = hexlify(maxPriorityFeePerGas);

    const userOpHash = await EntrypointContract.getUserOpHash(userOp);

    // const paymasterTransaction = await alchemyProvider.send(
    //   "alchemy_requestPaymasterAndData",
    //   [
    //     {
    //       policyId: "43ee9d32-f26f-482f-9602-5766f2b66196",
    //       entryPoint: ENTRYPOINT_CONTRACT,
    //       userOperation: userOp,
    //     },
    //   ]
    // );

    // userOp.paymasterAndData = paymasterTransaction.paymasterAndData;

    // const paymasterTransaction = await stackupPaymasterProvider.send(
    //   "pm_sponsorUserOperation",
    //   [userOp, ENTRYPOINT_CONTRACT, { type: "payg" }]
    // );

    userOp.signature = await simpleAccountOwner.signMessage(
      ethers.utils.arrayify(userOpHash)
    );

    // userOp.callGasLimit = paymasterTransaction.callGasLimit;
    // userOp.preVerificationGas = paymasterTransaction.preVerificationGas;
    // userOp.verificationGasLimit = paymasterTransaction.verificationGasLimit;

    return userOp;
  };

  const sendUserOp = async (userOp) => {
    // const opsTransaction = await stackupBundlerProvider.send(
    //   "eth_sendUserOperation",
    //   [userOp, ENTRYPOINT_CONTRACT]
    // );
    const result = await alchemyProvider.send("eth_sendUserOperation", [
      userOp,
      ENTRYPOINT_CONTRACT,
    ]);

    if (result && result.error && result.error.message) {
      throw new Error(result.error.message);
    } else if (result) {
      return result;
    } else {
      throw "Something went wrong. Please try again.";
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
        name: "safeTransferFrom",
        inputs: [
          {
            name: "from",
            type: "address",
          },
          {
            name: "to",
            type: "address",
          },
          {
            name: "id",
            type: "uint256",
          },
          {
            name: "amount",
            type: "uint256",
          },
          {
            name: "data",
            type: "bytes",
          },
        ],
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ]);

    function create1155TransactionData(address, recipient, quantity, balance) {
      return iface1155.encodeFunctionData("safeTransferFrom", [
        address,
        recipient,
        balance.id,
        quantity,
        "0x",
      ]);
    }

    const erc1155TxnData = create1155TransactionData(
      currentSimpleAccount,
      currentAccount,
      1,
      nft
    );

    request({
      from: currentSimpleAccount,
      to: ERC_1155_CONTRACT_ADDRESS,
      data: erc1155TxnData,
      value: "0x0",
    });
  };

  const sendTokenToVault = async () => {
    const buildTransactionData = () => {
      const abi = [
        {
          name: "transfer",
          constant: false,
          inputs: [
            {
              name: "to",
              type: "address",
            },
            {
              name: "value",
              type: "uint256",
            },
          ],
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
      ];

      const iface = new Interface(abi);

      // send 0.01 value of token
      return iface.encodeFunctionData("transfer", [
        currentAccount,
        BigNumber.from("10000000000000000"),
      ]);
    };

    const requestData = {
      to: ERC_20_CONTRACT_ADDRESS,
      from: currentSimpleAccount,
      data: buildTransactionData(),
      value: "0x0",
    };

    try {
      const result = await request(requestData);

      if (result) {
        alert(result);
      }
    } catch (e) {
      if (e.error.message) {
        alert(e.error.message);
      }
    }
  };

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <button
        className="btn btn-circle absolute top-4 left-4"
        onClick={() => goBack()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>
      <h1 className="text-4xl">Simple Account Example</h1>

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
          {currentAccount ? "Disconnect" : "Sign In With Bitski"}
        </button>

        <div className="flex flex-col w-full lg:flex-row">
          <div className="grid flex-grow card bg-base-300 rounded-box p-4 max-w-xl">
            {currentAccount ? (
              <div className="break-all">
                <p className="">Bitski Vault</p>
                <p className="mt-2 font-bold">{currentAccount}</p>
                {accountCurrencyBalance && (
                  <p className="mt-2 font-bold">
                    Balance: {getMaticBalance(accountCurrencyBalance)} MATIC
                  </p>
                )}
              </div>
            ) : (
              "Not logged in."
            )}
          </div>
          <div className="divider lg:divider-horizontal"></div>
          <div className="grid flex-grow card bg-base-300 rounded-box p-4 max-w-xl">
            {currentSimpleAccount ? (
              <div className="break-all">
                <p className="">
                  Simple Account{" "}
                  {!!isDeployed(currentSimpleAccount)
                    ? "(ACTIVE)"
                    : "(INACTIVE)"}
                </p>
                <p className="mt-2 font-bold">{currentSimpleAccount}</p>
                {simpleAccountCurrencyBalance && (
                  <p className="mt-2 font-bold">
                    Balance: {getMaticBalance(simpleAccountCurrencyBalance)}{" "}
                    MATIC
                  </p>
                )}
              </div>
            ) : (
              "Not logged in."
            )}
            {currentSimpleAccount && simpleAccountNftBalance ? (
              <p className="mt-2 font-bold break-all">
                NFT: {JSON.stringify(getNft(simpleAccountNftBalance))}
              </p>
            ) : null}
            {currentSimpleAccount && !sendNftHash ? (
              <button
                className="my-4 inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
                onClick={() => sendNftToVault()}
              >
                Send NFT to Vault
              </button>
            ) : null}
            {currentSimpleAccount && simpleAccountCurrencyBalance ? (
              <p className="mt-2 font-bold break-all">
                ERC20: {JSON.stringify(getErc20(simpleAccountCurrencyBalance))}
              </p>
            ) : null}
            {currentSimpleAccount && !sendTokenHash ? (
              <button
                className="mt-4 inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900"
                onClick={() => sendTokenToVault()}
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

export default SimpleExample;
