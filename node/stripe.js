var express = require('express');
const stripe = require('stripe')('stripe-key');
var app = express();
const cors=require('cors')
app.use(
    cors({
  
      origin: '*', // allow to server to accept request from different origin
  
      methods: 'GET,POST,PUT',
  
      credentials: true, // allow session cookie from browser to pass through
  
    }),
  
  );
  app.use(express.json());
  app.post('/charge', async (req, res) => {
    try {
      const { amount, source,paymentMethodId,stripeToken } = req.body;
  
      
// const customer = await stripe.customers.create({
//   name: 'Email Test User',
//   email: 'user@example.com',
// });


const customer = await stripe.customers.create({
  name: "Friend111 Test",
  email: "frien23test@yopmail.com",
  payment_method: paymentMethodId,
  // invoice_settings: {
  //     default_payment_method: paymentMethodId,
  // },
});
// console.log("customer",customer)

// var param = {
//   amount: '200',
//   currency: 'usd',
//   description:'First payment',
//   customer:customer.id
// }

// stripe.charges.create(param, function (err,charge) {
//   if(err)
//   {
//       console.log("err: "+err);
//   }if(charge)
//   {
//       console.log("success: "+JSON.stringify(charge, null, 2));
//   }else{
//       console.log("Something wrong")
//   }
// })

// const paymentIntent = await stripe.paymentIntents.create({
//   amount:100,
//   currency: 'usd', // Replace with your desired currency code
//   description: 'testffiinnalll',
//   payment_method: paymentMethodId,
//   customer:customer.id,
//   confirm: true, // This captures the payment immediately
//   automatic_payment_methods: {
//     enabled: true,
//     allow_redirects: 'never', // Disable redirect-based payment methods
//   },
//   payment_method_options: {
//     card: {
//       request_three_d_secure: 'any',
//     },
//   },
// });
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  customer: customer.id, // Optional, if you want to attach the Payment Intent to a specific customer
  payment_method: paymentMethodId,
  payment_method_types: ['card'],
   // Specify the payment method types accepted by the Payment Intent
   confirm:true,
  //  confirmation_method: 'automatic',
});

// console.log('Payment successful:');
if (paymentIntent.status === 'succeeded') {
  res.status(200).send({ message: 'Payment successful!',paymentIntent });
  // Payment succeeded, handle success
} else if (paymentIntent.status === 'requires_action' && paymentIntent.next_action.type === 'use_stripe_sdk') {
  // Payment requires authentication, handle it by returning the client secret to the frontend
  res.json({ requiresAction: true, clientSecret: paymentIntent.client_secret });
} else {
  // Handle other statuses
  res.status(500).json({ error: 'Unexpected PaymentIntent status' });
}

} catch (error) {
console.error('Payment failed:', error);
res.status(500).send({ message: 'Payment failed.' });
}
  })

   //not for 3d authe 
  //     const payment = await stripe.charges.create({
  //       amount: 100 , // Convert to cents (Stripe expects integers)
  //       currency: 'usd', // Replace with your desired currency code
  //       description:'testffiinnalll',
  //       source: stripeToken
  //       // source: 'tok_visa'
  //       // customer: customer.id
  //     });
  
  //     console.log('Payment successful:', payment);
  //     res.status(200).send({ message: 'Payment successful!' });
  //   } catch (error) {
  //     console.error('Payment failed:', error);
  //     res.status(500).send({ message: 'Payment failed.' });
  //   }
  // });



app.get('/create-checkout-session-in', async (req, res) => {
  // const { amount } = req.body;
try{
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd', // Replace with your desired currency code
          product_data: {
            name: 'One-Time Payment',
          },
          unit_amount: 100, // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/success', // Replace with your success URL
    cancel_url: 'http://localhost:3000/cancel',  // Replace with your cancel URL
  });
console.log("ssss",session)
  res.json({ clientSecret: session.client_secret });
} catch (error) {
  console.error("Error creating session:", error);
  res.status(500).json({ error: 'Failed to create session' });
}
});

app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;

  try {
    // Create a Price dynamically based on the amount received
    const price = await stripe.prices.create({
      // unit_amount: amount * 100, // Stripe requires amount in cents, so multiply by 100
      unit_amount: Number(amount) * 100, // Stripe requires amount in cents, so multiply by 100
      currency: 'usd', // Change currency as per your requirement
      product_data: {
        name: 'League', // Replace with your product name
      },
    });

    // Create a Checkout Session using the dynamically created Price
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id, // Use the dynamically created Price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3001/paymentsuccess`,
      cancel_url: 'http://localhost:3001/paymentfail',
      // success_url: `http://localhost:3002/success`,
      // cancel_url: 'http://localhost:3002/cancel',
    });
    console.log("ses",session)
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
    res.status(500).send({ error: 'An error occurred while creating Checkout Session.' });
  }
});
app.post('/delete-data', async (req, res) => {
  const { paymentIntentId, paymentMethodId, customerId } = req.body;

  try {
    // Cancel Payment Intent
    if (paymentIntentId) {
      await stripe.paymentIntents.cancel(paymentIntentId);
    }

    // Detach Payment Method
    if (paymentMethodId) {
      await stripe.paymentMethods.detach(paymentMethodId);
    }

    // Delete Customer
    // if (customerId) {
    //   await stripe.customers.del(customerId);
    // }

    res.status(200).send('Data successfully deleted.');
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).send('An error occurred while deleting data.');
  }
});

app.get('/session_status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  const customer = await stripe.customers.retrieve(session.customer);

  res.send({
    status: session.status,
    payment_status: session.payment_status,
    customer_email: customer.email
  });
});
app.get("/hello",async(req,res)=>{
  await res.send("Hello")
})

app.post('/webhook', async (req, res) => {
  try {
    let event=req.body
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Check payment status (Risky as data might be tampered with)
      if (session.payment_status === 'paid') {
        console.log('Payment Successful!',session);
        // Update your order status in the database (implementation not shown here)
        // ... your order update logic ...
      } else {
        console.log('Payment Failed:', session.payment_status);
        // Handle payment failure (e.g., notify customer)
      }
    }

    res.sendStatus(200); // Acknowledge receipt of the webhook

  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500); // Internal server error
  }
});


app.listen(4000, () => console.log('Server listening on port 4000'));

  app.listen(4242, function () {
    console.log("server running");
});