// import React, { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';

// // Replace with your actual Stripe publishable key
// const stripePromise = loadStripe('stripe-key');

// const PaymentForm = () => {
//   const [clientSecret, setClientSecret] = useState('');
//   const stripe = useStripe();
//   const elements = useElements();
  

//   useEffect(() => {
//     // Simulate fetching the client secret from your backend (replace with actual API call)
//     fetch('http://localhost:4242/charge', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ amount: 100 }), // Replace with actual amount
//     })
//       .then((res) => res.json())
//       .then((data) => setClientSecret(data.clientSecret));
//   }, []);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       // Stripe.js has not yet loaded. Make sure to disable form submission until Stripe.js has loaded.
//       return;
//     }

//     const result = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: elements.getElement(CardElement),
//       },
//     });

//     if (result.error) {
//       // Show error message to the user
//       console.error('Payment error:', result.error);
//     } else {
//       // Payment successful
//       console.log('Payment successful:', result.paymentIntent);
//       // Handle successful payment (e.g., redirect to confirmation page)
//     }
//   };

//   return (
//     <>
//     <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
//     <button type="submit" disabled={!stripe}>
//       Pay ${1000 / 100}
//     </button>
//     </>
//   );
// };

// export default PaymentForm;


import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('stripe-key');

const PaymentForm = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(null); // Store PaymentMethod ID
  const stripe = useStripe();
  const elements = useElements();

  // useEffect(() => {
  //   // Simulate fetching the client secret from your backend (replace with actual API call)
  //   fetch('http://localhost:4242/charge', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ amount: 100 }), // Replace with actual amount
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setClientSecret(data.clientSecret);
  //     });
  // }, []);

  const handleCreatePaymentMethod = async () => {
    if (!stripe || !elements) {
      console.error('Stripe.js not loaded yet.');
      return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error('Error creating PaymentMethod:', error);
      return;
    }

    setPaymentMethodId(paymentMethod.id); // Store PaymentMethod ID
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // if (!stripe || !elements) {
    //   // Stripe.js not loaded yet, disable form submission
    //   return;
    // }

    // if (!paymentMethodId) {
    //   console.error('No PaymentMethod ID available. Please create one first.');
    //   return;
    // }

   

    // Get the CardElement instance
    const cardElement = elements.getElement(CardElement);
  
    // Create a Stripe token with the card details
    const { token, error } = await stripe.createToken(cardElement);
    console.log("ttt",token)
  
    if (error) {
      // Handle any errors during token creation
      console.error("Error creating Stripe token:", error);
      // You can display an error message to the user here
    } 
  

    // **Avoid using stripe.confirmCardPayment here** (handled on backend)

    // **Logic to trigger a separate API call with paymentMethodId**
    // (Assuming your existing API call accepts a new field for paymentMethodId)
    try {
      const response = await fetch('http://localhost:4242/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // clientSecret, // Existing data
          paymentMethodId, // New data with PaymentMethod ID
          stripeToken: token.id
        }),
      });

      const backendResponse = await response.json();
      console.log("bbb",backendResponse)
      if (backendResponse.requiresAction) {
        // const { error: confirmationError } = await stripe.handleCardAction(
        //   backendResponse.clientSecret
        // );

        const { error: confirmationError, paymentIntent } = await stripe.confirmCardPayment(
          backendResponse.clientSecret,
          {
            payment_method: paymentMethodId
          }
        );
        if (confirmationError) {
          // Display error to the customer and try again
          console.log("error",confirmationError)
        } else {
          console.log("Payment Success")
          // Payment completed successfully
        }
      } else {
        console.log("Payment Success")
        // Payment completed successfully
      }
      
      // Handle successful backend response (e.g., confirmation page redirect)
    } catch (error) {
      console.error('Error calling backend API:', error);
    }
  };

  return (
    <>
      <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      <button type="button" onClick={handleCreatePaymentMethod}>
        Create Payment Method
      </button>
      {/* <button type="submit" onClick={handleSubmit} disabled={!stripe || !paymentMethodId}> */}
      <button type="submit" onClick={handleSubmit} >
        Pay ${1000 / 1000}
      </button>
    </>
  );
};

export default PaymentForm;




//checkout
// import React, { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';

// const stripePromise = loadStripe('stripe-key'); // Replace with your Stripe publishable key

// const PaymentForm = () => {
//   const [clientSecret, setClientSecret] = useState('');

//   useEffect(() => {
//     // Fetch the Checkout Session client secret from your Node.js backend
//     fetch('http://localhost:4242/create-checkout-session')
//       .then(res => res.json())
//       .then(data => setClientSecret(data.clientSecret));
//   }, []);

//   const handleFormSubmit = async (event) => {
//     event.preventDefault();

//     if (!clientSecret) {
//       console.error('Client secret not yet received from API');
//       return; // Prevent further execution if clientSecret is null
//     }

//     // Use Stripe.js to handle payment form submission
//     const stripe = await stripePromise;
//     const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: event.target.elements.card,
//       },
//     });

//     if (error) {
//       // Handle payment errors gracefully
//       console.error('Payment error:', error);
//     } else {
//       // Payment successful, handle confirmation or next steps
//       console.log('Payment successful:', paymentIntent);
//     }
//   };

//   return (
//     <Elements stripe={stripePromise}>
//       <form onSubmit={handleFormSubmit}>
//         {/* Payment form elements (Card Element, etc.) */}
//         <button type="submit">Pay Now</button>
//       </form>
//     </Elements>
//   );
// };

// export default PaymentForm;



