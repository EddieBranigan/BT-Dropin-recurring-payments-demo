const express = require("express");
const router = express.Router();
const braintree = require("braintree");
const dotenv = require("dotenv").config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BT_MERCHANT_ID,
  publicKey: process.env.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY,
});

router.get("/getNonce/:token", async (req, res) => {
  try {
    const result = await gateway.paymentMethodNonce.create(req.params.token);
    res.status(200).send(result); // 200 OK for successful responses
  } catch (error) {
    console.error("Error creating payment method nonce:", error.message);

    if (error.type === 'notFoundError') {
      res.status(404).send({ error: "Token not found" }); // 404 if token is invalid
    } else if (error.type === 'validationError') {
      res.status(400).send({ error: "Invalid token" }); // 400 for validation errors
    } else {
      res.status(500).send({ error: "Internal server error" }); // 500 for other server issues
    }
  }
});

// Endpoint for access token
router.get("/", (req, res) => {
  gateway.clientToken.generate({merchantAccountId:"IntegrationTutorials-GB"})
  .then(response => res.send(response.clientToken));
});

// Endpoint for refund request
router.post("/refund", (req, res) => {
  const { amount, txnId } = req.body;
  gateway.transaction.refund(txnId, amount)
  .then(result => res.send(result))
});

// Endpoint for capturing transactions
router.post("/", (req, res, next) => {
  const { paymentMethodNonce, deviceData, amount, transactionSource } = req.body;
  const txn = {
    amount: amount,
    paymentMethodNonce: paymentMethodNonce,
    customer: {
      email: 'tony@avengers.com',
      firstName: 'Tony',
      lastName: 'Stark',
      website: 'www.avengers.com'
    },
    options: {
      submitForSettlement: true,
      storeInVaultOnSuccess: !!deviceData,
    },
  }

  transactionSource ? txn.transactionSource = transactionSource: null;
  deviceData ? txn.deviceData = deviceData : null;

  gateway.transaction.sale(txn).then(result => res.send(result));
});


module.exports = router;