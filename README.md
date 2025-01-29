# BT-Dropin-recurring-payments-demo
A simple braintree server built in NodeJS with express framework and using the Braintree drop-in integration. This code shows how to create simple MIT and CIT payment flows.

## Setup instructions
Install the packages from the package-json file by typing into terminal:
```
npm install
```

Make sure to create a .env file with your gateway credentials in it. An example is provided ('example.env').

## Start the server
Start the server by typing into terminal:
```
node server.js
```

## Testing
Testing in the Braintree sandbox environment can be done using testing card numbers provided in the [Braintree developer docs located here](https://developer.paypal.com/braintree/docs/reference/general/testing/node#valid-card-numbers).

**NOTE:**
When testing card verifications and transactions, keep in mind:

- Transaction success is determined by the test amount you use. For example, when testing decline scenarios.
- Verification success is determined by the test card number you use. For example, when testing Vault and recurring billing scenarios.

## Disclaimer
This repository is for illustrative purposes only and shouldn't be used directly in a live environment.
