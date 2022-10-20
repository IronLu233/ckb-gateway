import React, { useEffect, useState } from "react";
import { helpers, Script } from "@ckb-lumos/lumos";
import { getConfig } from "@ckb-lumos/config-manager";
import { omnilock } from "@ckb-lumos/common-scripts";
import { asyncSleep, capacityOf, ethereum, transfer } from "./lib";

function App() {
  const [ethAddr, setEthAddr] = useState("");
  const [omniAddr, setOmniAddr] = useState("");
  const [omniLock, setOmniLock] = useState<Script>();
  const [balance, setBalance] = useState("-");

  const [transferAddr, setTransferAddress] = useState(
    "ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvdnmgaegcg39jr2y9f7u9me2z6qn7calqjk6qlp"
  );
  const [transferAmount, setTransferAmount] = useState("14200000000");

  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    asyncSleep(100).then(() => {
      if (ethereum.selectedAddress) connectToMetaMask();
      ethereum.addListener("accountsChanged", connectToMetaMask);
    });
  }, []);

  function connectToMetaMask() {
    ethereum
      .enable()
      .then(([ethAddr]: string[]) => {
        const CONFIG = getConfig();
        const omniLock = omnilock.createOmnilockScript(
          {
            auth: {
              flag: "ETHEREUM",
              content: ethAddr,
            },
          },
          {
            config: CONFIG,
          }
        );

        const omniAddr = helpers.encodeToAddress(omniLock);

        setEthAddr(ethAddr);
        setOmniAddr(omniAddr);
        setOmniLock(omniLock);

        return omniAddr;
      })
      .then((omniAddr) => capacityOf(omniAddr))
      .then((balance) => setBalance(balance.div(10 ** 8).toString() + " CKB"));
  }

  function onTransfer() {
    if (isSendingTx) return;
    setIsSendingTx(true);

    transfer({ amount: transferAmount, from: omniAddr, to: transferAddr })
      .then(setTxHash)
      // .catch((e) => alert(e.message || JSON.stringify(e)))
      .finally(() => setIsSendingTx(false));
  }

  if (!ethereum) return <div>MetaMask is not installed</div>;
  if (!ethAddr)
    return <button onClick={connectToMetaMask}>Connect to MetaMask</button>;

  return (
    <div>
      <ul>
        <li>Ethereum Address: {ethAddr}</li>
        <li>Nervos Address(Omni): {omniAddr}</li>
        <li>
          Current Omni lock script:
          <pre>{JSON.stringify(omniLock, null, 2)}</pre>
        </li>

        <li>Balance: {balance}</li>
      </ul>

      <div>
        <h2>Transfer to</h2>
        <label htmlFor="address">Address</label>&nbsp;
        <input
          id="address"
          type="text"
          value={transferAddr}
          onChange={(e) => setTransferAddress(e.target.value)}
          placeholder="ckt1..."
        />
        <br />
        <label htmlFor="amount">Amount</label>
        &nbsp;
        <input
          id="amount"
          type="text"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="shannon"
        />
        <br />
        <button onClick={onTransfer}>Transfer</button>
        <p>Tx Hash: {txHash}</p>
      </div>
    </div>
  );
}

export default App;
