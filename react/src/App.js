import logo from './logo.svg';
import './App.css';
import PaymentForm from './PaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('stripe-key');

function App() {
  return (
    <div className="App">
     <h1>Stripe Payment Example</h1>
     <Elements stripe={stripePromise}>
    <PaymentForm />  {/* Your PaymentForm component goes here */}
  </Elements>
    </div>
  );
}

export default App;

//checkout

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import PaymentForm from './PaymentForm';
// import SuccessPage from './SuccessPage';
// import CancelPage from './CancelPage';
// import Checkout from './Checkout';

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Checkout/>} />
//         <Route path="/payment" element={<PaymentForm />} />
//         <Route path="/success" element={<SuccessPage />} />
//         <Route path="/cancel" element={<CancelPage />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

