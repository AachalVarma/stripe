// Checkout.js

import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('stripe-key'); 

const Checkout = () => {
  const [amount, setAmount] = useState(0); // State to hold the amount
  const [paymentStatus, setPaymentStatus] = useState('idle');

  const handleAmountChange = (event) => {
    setAmount(parseInt(event.target.value)); // Convert input value to integer
  };

  const handleClick = async () => {
    try {
      const response = await axios.post('http://localhost:4242/create-checkout-session', {
        amount: amount,
      });

      const sessionId = response.data.id;
     console.log("sssssssss",sessionId);
     localStorage.setItem('sessionIdHL',sessionId)
      // Redirect to Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });
      console.log("rrrrr",result)

      if (result.error) {
        console.error("errro",result.error.message);
        setPaymentStatus('error');
        console.error("stat",paymentStatus);

      }else{
        console.log("Successs")
      }
    } catch (error) {
        setPaymentStatus('error');
      console.error('Error:', error);
    }
   
  };

  return (
    <div>
      <input type="number" value={amount} onChange={handleAmountChange} />
      <button onClick={handleClick}>Checkout</button>
      {paymentStatus === 'success' && <p>Payment Successful!</p>}
      {paymentStatus === 'error' && <p>Payment Error: Please try again.</p>}
      {paymentStatus === 'idle' && <p>Payment Status: Pending</p>}
    </div>
  );
};

export default Checkout;

// const stripe = await stripePromise;
// const { error } = await stripe.redirectToCheckout({
//   sessionId: sessionId,
// });

// if (error) {
//   // Handle errors from redirectToCheckout
//   throw new Error(error.message);
// } else {
//   // Handle success case
//   // You can listen to the `checkout.session.completed` event on your server
//   // and perform actions like updating your database with the payment status
//   // For now, you can just show an alert for demonstration purposes
//   alert('Payment successful!');
// }
// } catch (error) {
// // Handle errors from axios or any other errors
// console.error('Error:', error);
// // Show an alert for failed payment
// alert('Payment failed. Please try again later.');
// }