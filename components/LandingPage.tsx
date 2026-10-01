import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SNABBB_SIGNUP_URL } from '../constants/authLinks';
import './landing.css';

const features = [
  {
    icon: Clock3,
    title: 'True Hourly Chair Rate',
    description:
      'Understand the real cost of running your clinic per hour, including rent, staff, depreciation, and consumables.',
  },
  {
    icon: BarChart3,
    title: 'Treatment ROI Engine',
    description:
      'Build treatment models item by item and see exactly how much profit each procedure generates.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Forecasting',
    description:
      'Set revenue goals and calculate how many treatments your clinic needs to reach them.',
  },
  {
    icon: Calculator,
    title: 'Procedure Builder',
    description:
      'Create detailed treatment models with chair time, materials, commissions, and overhead allocation.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Cloud Workspace',
    description:
      'Keep your clinic’s financial models private with secure cloud storage and account-level access.',
  },
  {
    icon: Sparkles,
    title: 'Actionable Insights',
    description:
      'Turn complicated numbers into practical decisions your team can use immediately.',
  },
];

const faqs = [
  {
    question: 'Do I need an accounting background?',
    answer:
      'No. Snabbb is designed for dentists and clinic managers. The calculations happen automatically while you focus on making better clinical and business decisions.',
  },
  {
    question: 'What can I calculate?',
    answer:
      'You can model overhead, staffing, depreciation, consumables, sterilization, laboratory costs, marketing, regulatory expenses, owner costs, and treatment profitability.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Your calculator data is stored in your authenticated workspace with account-level access controls and secure cloud infrastructure.',
  },
  {
    question: 'Does Snabbb integrate with Odoo?',
    answer:
      'Snabbb supports connected Odoo workflows and Single Sign-On, so your team can access the calculator without managing another separate password.',
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const overhead = 15000;
  const revenuePerTreatment = 800;
  const materialCostPerTreatment = 150;

  const grossRevenue = volume * revenuePerTreatment;
  const materialCost = volume * materialCostPerTreatment;
  const netProfit = grossRevenue - materialCost - overhead;

  const closeMenu = () => setMenuOpen(false);

  const openLogin = () => {
    closeMenu();
    navigate('/login');
  };

  return (
    <main className="landing-page" id="top">
      <nav className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="Snabbb Calculator home">
          <img src="/Snabbb (Teal).png" alt="Snabbb" />
          <span>Calculator</span>
        </a>

        <div className={`landing-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#simulator" onClick={closeMenu}>Simulator</a>
          <a href="#workflow" onClick={closeMenu}>How it works</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>

          <div className="landing-mobile-actions">
            <button className="landing-mobile-login" onClick={openLogin}>
              Log In
            </button>

            <a
              className="landing-mobile-signup"
              href={SNABBB_SIGNUP_URL}
              onClick={closeMenu}
            >
              Sign Up <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-login" onClick={openLogin}>
            Log In
          </button>

          <a className="landing-nav-cta" href={SNABBB_SIGNUP_URL}>
            Sign Up <ArrowRight size={16} />
          </a>
        </div>

        <button
          className="landing-menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow">
            <span className="landing-live-dot" />
            Smart clinic analytics engine
          </div>

          <h1>
            Make every treatment
            <em> more profitable.</em>
          </h1>

          <p>
            Model your clinic’s real costs, understand treatment margins, and
            forecast revenue accurately from one clear financial workspace.
          </p>

          <div className="landing-hero-actions">
            <a className="landing-primary-button" href={SNABBB_SIGNUP_URL}>
              Sign Up <ArrowRight size={18} />
            </a>

            <a className="landing-secondary-button" href="#features">
              Explore features
            </a>
          </div>

          <div className="landing-trust-row">
            <span><CheckCircle2 size={16} /> Real-time calculations</span>
            <span><CheckCircle2 size={16} /> Clinic-focused models</span>
            <span><CheckCircle2 size={16} /> Secure workspace</span>
          </div>
        </div>

        <div className="landing-hero-preview">
          <div className="preview-glow preview-glow-one" />
          <div className="preview-glow preview-glow-two" />

          <div className="calculator-preview">
            <div className="calculator-preview-header">
              <div>
                <small>SNABBB CALCULATOR</small>
                <strong>Clinic profitability</strong>
              </div>
              <span className="preview-live-badge">LIVE</span>
            </div>

            <div className="calculator-preview-body">
              <div className="preview-heading-row">
                <div>
                  <small>Monthly overview</small>
                  <h3>Profit snapshot</h3>
                </div>
                <div className="preview-period">This month</div>
              </div>

              <div className="preview-metrics">
                <div>
                  <small>Revenue</small>
                  <strong>USD 42,800</strong>
                  <span className="positive">+18.4%</span>
                </div>
                <div>
                  <small>Net margin</small>
                  <strong>34.6%</strong>
                  <span className="positive">+6.2%</span>
                </div>
              </div>

              <div className="preview-chart">
                <span className="chart-line chart-line-one" />
                <span className="chart-line chart-line-two" />
                <span className="chart-line chart-line-three" />
                <span className="chart-point chart-point-one" />
                <span className="chart-point chart-point-two" />
                <span className="chart-point chart-point-three" />
                <span className="chart-point chart-point-four" />
              </div>

              <div className="preview-cost-list">
                <div>
                  <span className="preview-icon teal"><Clock3 size={14} /></span>
                  <span><strong>Hourly chair rate</strong><small>Clinic overhead allocation</small></span>
                  <b>USD 145/hr</b>
                </div>
                <div>
                  <span className="preview-icon blue"><BarChart3 size={14} /></span>
                  <span><strong>Treatment ROI</strong><small>Average procedure margin</small></span>
                  <b>42.8%</b>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-card floating-card-profit">
            <TrendingUp size={18} />
            <div><strong>Profit trend</strong><span>Improving this month</span></div>
          </div>

          <div className="floating-card floating-card-time">
            <Clock3 size={18} />
            <div><strong>12 hrs saved</strong><span>Every week</span></div>
          </div>
        </div>
      </section>

      <section className="landing-stat-strip">
        <div><strong>10+</strong><span>financial calculators</span></div>
        <div><strong>100%</strong><span>clinic-focused modelling</span></div>
        <div><strong>24/7</strong><span>access to your workspace</span></div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-heading">
          <div className="landing-section-label">Everything in one place</div>
          <h2>Financial clarity for modern clinics.</h2>
          <p>
            Replace scattered spreadsheets and assumptions with a structured
            workspace built around the way clinics actually operate.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, title, description }) => (
            <article className="landing-feature-card" key={title}>
              <div className="landing-feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <ArrowRight className="feature-arrow" size={17} />
            </article>
          ))}
        </div>
      </section>

      <section id="simulator" className="landing-section landing-simulator-section">
        <div className="landing-simulator-copy">
          <div className="landing-section-label">Try the model</div>
          <h2>See how treatment volume changes your real margin.</h2>
          <p>
            Adjust the monthly treatment volume and see how gross revenue,
            material cost, and fixed overhead affect your net profit.
          </p>

          <div className="simulator-control">
            <div>
              <strong>Monthly treatment volume</strong>
              <span>Number of procedures performed</span>
            </div>
            <b>{volume}</b>
            <input
              type="range"
              min="10"
              max="150"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              aria-label="Monthly treatment volume"
            />
          </div>
        </div>

        <div className="simulator-card">
          <div className="simulator-card-header">
            <span><Calculator size={18} /> Monthly simulation</span>
            <small>USD</small>
          </div>

          <div className="simulator-row">
            <span>Gross revenue</span>
            <strong>{grossRevenue.toLocaleString()}</strong>
          </div>
          <div className="simulator-row negative">
            <span>Materials</span>
            <strong>- {materialCost.toLocaleString()}</strong>
          </div>
          <div className="simulator-row negative">
            <span>Fixed overhead</span>
            <strong>- {overhead.toLocaleString()}</strong>
          </div>

          <div className={`simulator-result ${netProfit < 0 ? 'loss' : ''}`}>
            <small>True net profit</small>
            <strong>USD {netProfit.toLocaleString()}</strong>
            <span>{netProfit < 0 ? 'Operating at a loss' : 'Profitable margin achieved'}</span>
          </div>
        </div>
      </section>

      <section id="workflow" className="landing-section landing-workflow-section">
        <div className="landing-workflow-visual">
          <div className="workflow-card">
            <div className="workflow-card-top">
              <div>
                <small>PROCEDURE MODEL</small>
                <strong>Composite restoration</strong>
              </div>
              <CheckCircle2 size={28} />
            </div>

            <div className="workflow-progress-label">
              <span>Model completeness</span><b>86%</b>
            </div>
            <div className="workflow-progress"><span /></div>

            <div className="workflow-list">
              <div><Check size={15} /><span>Chair time</span><b>45 min</b></div>
              <div><Check size={15} /><span>Materials</span><b>USD 82</b></div>
              <div><Check size={15} /><span>Doctor commission</span><b>20%</b></div>
              <div><Check size={15} /><span>Expected margin</span><b className="green">38.4%</b></div>
            </div>
          </div>
        </div>

        <div className="landing-workflow-copy">
          <div className="landing-section-label">How it works</div>
          <h2>From setup to smarter pricing in three steps.</h2>
          <p>
            Build a reliable financial model once, then use it to make faster
            decisions across your clinic.
          </p>

          <div className="workflow-steps">
            <div><b>01</b><p><strong>Input your clinic costs</strong>Add overheads, staffing, equipment, and operating expenses.</p></div>
            <div><b>02</b><p><strong>Build treatment models</strong>Combine chair time, materials, commissions, and pricing.</p></div>
            <div><b>03</b><p><strong>Analyse your margins</strong>Use the results to improve pricing and reach revenue targets.</p></div>
          </div>
        </div>
      </section>

      <section id="faq" className="landing-section landing-faq-section">
        <div className="landing-section-heading">
          <div className="landing-section-label">Questions</div>
          <h2>Good to know.</h2>
          <p>Some quick answers about the Snabbb Calculator.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div className={`faq-item ${isOpen ? 'open' : ''}`} key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={19} />
                </button>

                {isOpen && <div className="faq-answer"><p>{faq.answer}</p></div>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="landing-final-cta">
        <div>
          <div className="landing-section-label">Ready when you are</div>
          <h2>Stop guessing your clinic’s margins.</h2>
          <p>Build a clearer financial picture and start making more confident decisions.</p>
        </div>

        <a className="landing-light-button" href={SNABBB_SIGNUP_URL}>
          Sign Up <ArrowRight size={18} />
        </a>
      </section>

      <footer className="landing-footer">
        <a className="landing-brand" href="#top">
          <img src="/Snabbb (White).png" alt="Snabbb" />
          <span>Calculator</span>
        </a>

        <p>Clinical modelling for more profitable practices.</p>

        <div>
          <a href="#features">Features</a>
          <a href="#simulator">Simulator</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
