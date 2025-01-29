var submitButton = document.getElementById("submit-button");
const amount = "500.00";
let lineItems = [
  {
    quantity: "1",
    unitAmount: "250.00",
    name: "Product A",
    description: "Eds magic product.",
    productCode: "123ABC",
    kind: "debit",
    totalAmount: "250.00"
  },
  {
    quantity: "1",
    unitAmount: "250",
    name: "Product B",
    description: "Playstation 7",
    productCode: "XYZ567",
    kind: "debit",
    totalAmount: "250"
  }
];
let billingAddress = {
  givenName: "Tony",
  surname: "Stark",
  email: "tony@avengers.com",
  phoneNumber: "8101234567",
  streetAddress: "555 Smith St.",
  extendedAddress: "#5",
  locality: "Oakland",
  region: "CA",
  postalCode: "12345",
  countryCodeAlpha2: "US"
};
let customer = {
  firstName: "Tony",
  lastName: "Stark",
  email: "tony@avengers.com"
};
let shippingAddress = {
  firstName: "Tony",
  lastName: "Stark",
  email: "tony@avengers.com"
};
var threeDSecureParameters = {
  amount: amount,
  email: "test@example.com",
  customer: customer,
  billingAddress: billingAddress,
  shippingAddress: shippingAddress
};

fetch("/checkout")
  .then((response) => response.text())
  .then((clientToken) => {
    braintree.dropin.create(
      {
        authorization: clientToken,
        amount: amount,
        container: "#dropin-container",
        locale: "en_GB",
        dataCollector: "true",
        card: {
          overrides: {
            fields: {
              number: { prefill: "4000000000001091" },
              expirationDate: { prefill: "09/29" },
            }
          },
        },
        threeDSecure: { authorization: clientToken },
        paypal: {
          flow: "vault", // checkout or vault
          amount: amount,
          currency: "GBP",
          commit: "true",
          billingAgreementDescription: 'You can customise this billing agreement description',
          buttonStyle: {
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            size: 'large'
          }
        },
        googlePay: {
          googlePayVersion: 2,
          //googleMerchantId: 'merchant-id-from-google',
          transactionInfo: {
            totalPriceStatus: "FINAL",
            totalPrice: amount,
            currencyCode: "GBP",
            checkoutOption: "COMPLETE_IMMEDIATE_PURCHASE",
          },
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                billingAddressRequired: false,
                billingAddressParameters: {
                  format: "FULL"
                }
              }
            }
          ]
        },
      })
      .then((instance) => {
        submitButton.addEventListener("click", (clickEvent) => {
          clickEvent.preventDefault();

          var paymentOptions =
          {
            amount: amount,
            threeDSecure: threeDSecureParameters,
            challengeRequested: true,
            collectDeviceData: true
          }

          instance.requestPaymentMethod(paymentOptions)
            .then((payload) => {
              document.getElementById("checkout-message").innerHTML =
                "Payload nonce: <pre>" + payload.nonce + "</pre>";
              fetch("/checkout", {
                method: "POST",
                body: JSON.stringify({
                  paymentMethodNonce: payload.nonce,
                  deviceData: payload.deviceData,
                  lineItems: lineItems,
                  amount: amount,
                  transactionSource: 'recurring_first'
                }),
                headers: {
                  "Content-Type": "application/json"
                }
              })
                .then((response) => response.json())
                .then((result) => {
                  instance.teardown((teardownErr) => {
                    if (teardownErr) {
                      console.error("Could not tear down Drop-in UI!");
                    } else {
                      console.info("Drop-in UI has been torn down!");
                    }
                  });
                  document.getElementById("checkout-message").style.visibility =
                    "visible";
                  if (result.success) {
                    document.getElementById("checkout-message").innerHTML =
                      "<pre>" +
                      JSON.stringify(result, null, 3) +
                      "</pre>";
                  } else {
                    document.getElementById("checkout-message").innerHTML =
                      "<pre>" +
                      JSON.stringify(result, null, 3) +
                      "</pre>";
                  }
                });
            }
            );
        });
      }
    );
  });
