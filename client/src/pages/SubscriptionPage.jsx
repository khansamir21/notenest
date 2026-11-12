import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Zap, Crown, Award, FileText, Sparkles, ShieldAlert } from 'lucide-react';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Razorpay Script dynamically load karne ka function
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planId, planName) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login first to purchase a subscription!');
      navigate('/login');
      return;
    }
    const currentUser = JSON.parse(storedUser);

    setLoadingPlan(planId);
    
    // 1. Load Razorpay SDK Script
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Check your internet connection.');
      setLoadingPlan(null);
      return;
    }

    try {
      // 2. Backend se Order Create karwaye
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const order = await orderResponse.json();

      if (!order.id) {
        alert('Server error while creating payment order.');
        setLoadingPlan(null);
        return;
      }

      // 3. Razorpay Checkout Options Configure karein
      const options = {
        key: "rzp_test_TyixONKsOhlda5", // ⚠️ Yahan apni asli Razorpay Test Key ID dalein (jaise rzp_test_xxxxxx)
        amount: order.amount,
        currency: order.currency,
        name: "NoteNest",
        description: `Purchase ${planName}`,
        order_id: order.id,
        handler: async function (response) {
          // 4. Payment successful hone ke baad verification ke liye backend bhejein
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: currentUser.email,
                planId
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              localStorage.setItem('user', JSON.stringify(verifyData.user));
              alert(`🎉 Payment Successful! You are now subscribed to the ${planName}.`);
              navigate('/upload');
            } else {
              alert(verifyData.error || 'Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.open();

    } catch (err) {
      console.error('Payment error:', err);
      alert('Something went wrong during payment initialization.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const tiers = [
    {
      id: 'free',
      name: 'Starter (Free)',
      price: '₹0',
      duration: 'forever',
      description: 'Max 5 Notes Free Upload',
      features: ['Personal Dashboard', 'Access Public Notes'],
      buttonText: 'Current Plan',
      isCurrent: true
    },
    {
      id: 'pro20',
      name: 'Pro 20',
      price: '₹299',
      duration: 'one-time',
      description: '+20 Notes (+5 Free)',
      features: ['Ad-free Experience', 'Priority Listing', 'Priority Support'],
      buttonText: 'Get Pro 20 Now'
    },
    {
      id: 'pro50',
      name: 'Pro 50',
      price: '₹599',
      duration: 'one-time',
      description: '+50 Notes (+5 Free)',
      features: ['Ad-free Experience', 'Verified Badge', 'Priority Support'],
      buttonText: 'Get Pro 50 Now',
      highlighted: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '₹999',
      duration: 'one-time',
      description: 'Unlimited Note Uploads',
      features: ['Ultimate Pro Badge', 'Early Access Features', 'Unlimited Storage'],
      buttonText: 'Go Unlimited Now',
      isLifetime: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 shadow-sm border border-blue-100">
            <Sparkles size={14} className="animate-pulse" />
            <span>NoteNest Premium Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            NoteNest Premium: Unlock More, Learn Faster
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Choose a plan that fits your study needs and pay securely via UPI, Card, or NetBanking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`bg-white border ${tier.highlighted ? 'border-2 border-blue-600 shadow-xl' : tier.isLifetime ? 'border-2 border-emerald-600 shadow-xl' : 'border-gray-200 shadow-md'} rounded-3xl p-6 flex flex-col justify-between relative transition-transform hover:-translate-y-2`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl tracking-wide uppercase">
                  Recommended
                </div>
              )}
              {tier.isLifetime && (
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl tracking-wide uppercase">
                  Best Value
                </div>
              )}

              <div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  {tier.id === 'free' && <FileText size={16} />}
                  {tier.id === 'pro20' && <Zap size={16} className="text-blue-600" />}
                  {tier.id === 'pro50' && <Crown size={16} className="text-blue-600" />}
                  {tier.id === 'lifetime' && <Award size={16} className="text-emerald-600"/>}
                  {tier.name}
                </div>
                
                <div className="text-3xl font-extrabold text-gray-900 mb-1">
                  {tier.price} <span className="text-xs font-normal text-gray-500">/ {tier.duration}</span>
                </div>
                <p className="text-gray-600 font-medium text-xs mb-6 h-6">{tier.description}</p>
                
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <ul className="space-y-3 text-xs text-gray-600">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">✓</div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => handleUpgrade(tier.id, tier.name)}
                disabled={tier.isCurrent || loadingPlan === tier.id}
                className={`w-full ${tier.isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : tier.highlighted ? 'bg-blue-600 hover:bg-blue-700 text-white' : tier.isLifetime ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'} font-medium py-2.5 rounded-xl transition shadow-sm text-sm cursor-pointer`}
              >
                {loadingPlan === tier.id ? 'Processing...' : tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-14 text-xs text-gray-500 border-t border-gray-100 pt-6 max-w-md mx-auto flex items-center justify-center gap-2">
          <ShieldAlert size={16} className="text-gray-400" />
          <p>Secured by Razorpay. Instant activation upon successful payment.</p>
        </div>

      </div>
    </div>
  );
};

export default SubscriptionPage;