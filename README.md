# CKB-Gateway

## Motivation
The CKB contract is very flexible and can theoretically support any form of HMAC, so it can support signature verification on any blockchain in CKB, therefore, CKB can use other blockchain wallets as CKB's wallet, e.g. Ethereum / Cardano etc.

The user experience of these wallets is excellent, the transaction will be displayed when signing. For example, when we transfer ERC20, MetaMask will show the recipient address, type of the token and token amount, this is because MetaMask is able to recognize ERC20 transactions. However, MetaMask doesn't recognize CKB's transactions, so we can only use an API like personal_sign to sign the hashed transaction. The hashed transactions are unreadable for dApp users, so dApp users are at risk of being phished.

## Validate Receiver Side SDK Usage

For example, we have a App, receive the CKB transaction validate request from some dApp.

When the App receive the raw transaction and message for signing, it shows human-readable transaction information in the UI, and tells the validate result.
Then if verification is passed. user can click sign button, to request wallet for signing message. 
Finally, the App send the signed message origin dApp.

``` typescript
const receiver = new WalletGatewayReceiver();
receiver.init(); // this is required. for telling the dApp the receiver is ready.

receiver.on('ValidateSuccess', ({ txSkeleton, messageForSigning, hashAlgorithm, hashContentExceptRawTx, signingType }) => {
    // you can access the raw transaction, and show it in your UI.
});

receiver.on('ValidateFailed', ({ txSkeleton, messageForSigning, hashAlgorithm, hashContentExceptRawTx, signingType }) => {
    // here, we tells the user the transaction is invalid.
    // and show an error message.
});

// when the validate is passed, and user click "Sign" button, invoke`requestSign` to request wallet for signing

const signedMessage = await receiver.requestSign();
```

This validate receiver App should be deployed on a server, and the server should be accessible from the internet.

## Validate Sender Side SDK Usage
Here we have a dApp, want sign a transaction and send it to network.


``` typescript
const sender = new WalletGatewaySender('http://localhost:2333'/* wallet gateway receiver address */);
await sender.requestValidate({
    txSkeleton,
    messageForSigning,
    hashAlgorithm,
    hashContentExceptRawTx,
    signingType,
});

sender.on('ValidateSuccess', () => {
    // the receiver validate success, and user click "Sign" button, invoke`requestSign` to request wallet for signing
    const signedMessage = await sender.requestSign();
    // send the transaction with signed message to network
});

sender.on('ValidateFailed', () => {
    // the receiver validate failed, warn user something is tampered
});

sender.on('SignSuccess', ({ messageForSigning }) => {
    // the receiver sign success, you can get the signed message.
});
```