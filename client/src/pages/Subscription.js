import React, { useState } from 'react';
import '../styles/Subscription.css';

function Subscription({ user, setUser, token }) {
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'Forever',
      description: 'Perfect for getting started',
      features: [
        '1 Project',
        '1 GB Storage',
        '1 Team Member',
        'Basic Analytics',
      ],
      tier: 'free',
      current: user?.subscriptionTier === 'free',
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For growing teams',
      features: [
        '10 Projects',
        '50 GB Storage',
        '5 Team Members',
        'Advanced Analytics',
        'Priority Support',
      ],
      tier: 'pro',
      current: user?.subscriptionTier === 'pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For large organizations',
      features: [
        '100 Projects',
        '500 GB Storage',
        '50 Team Members',
        'Advanced Analytics',
        'Dedicated Support',
        'Custom Integrations',
      ],
      tier: 'enterprise',
      current: user?.subscriptionTier === 'enterprise',
    },
  ];

  const handleUpgrade = async (tier) => {
    setLoading(true);
    try {
      const response = await fetch('https://versionflow.onrender.com/api/auth/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error upgrading', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Scale your workspace with flexible pricing</p>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div 
            key={plan.tier} 
            className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.current ? 'current' : ''}`}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            {plan.current && <div className="current-badge">Current Plan</div>}

            <h2>{plan.name}</h2>
            <div className="price">
              <span className="amount">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </div>
            <p className="description">{plan.description}</p>

            <ul className="features-list">
              {plan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>

            {!plan.current ? (
              <button 
                className="upgrade-btn"
                onClick={() => handleUpgrade(plan.tier)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Upgrade to ' + plan.name}
              </button>
            ) : (
              <button className="current-btn" disabled>
                Current Plan
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h4>Can I change my plan anytime?</h4>
          <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
        </div>
        <div className="faq-item">
          <h4>What happens to my data when I downgrade?</h4>
          <p>Your data is preserved. If you exceed limits, you'll be prompted to remove resources.</p>
        </div>
        <div className="faq-item">
          <h4>Do you offer annual billing?</h4>
          <p>Contact our sales team for annual billing options and custom enterprise solutions.</p>
        </div>
      </div>
    </div>
  );
}

export default Subscription;
