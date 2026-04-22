import { useState } from "react";

const SAFFRON = "#F5A623";
const DEEP = "#1A1A2E";
const CARD = "#16213E";
const MUTED = "#0F3460";
const TEXT = "#E8E8E8";
const SOFT = "#A8B2C8";
const GREEN = "#2ECC71";
const RED = "#E74C3C";
const BLUE = "#3498DB";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .wlp * { box-sizing: border-box; margin: 0; padding: 0; }
  .wlp { background: ${DEEP}; font-family: 'DM Sans', sans-serif; color: ${TEXT}; }

  .wlp .app { min-height: 100vh; background: ${DEEP}; padding: 0 0 60px 0; }

  .wlp .header {
    background: linear-gradient(135deg, #0F3460 0%, #16213E 60%, #1A1A2E 100%);
    padding: 24px 16px 20px;
    border-bottom: 3px solid ${SAFFRON};
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 640px) { .wlp .header { padding: 32px 24px 24px; } }
  .wlp .header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .wlp .header-badge {
    display: inline-block;
    background: rgba(245,166,35,0.15);
    border: 1px solid rgba(245,166,35,0.4);
    color: ${SAFFRON};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 12px;
  }
  .wlp .header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(24px, 5vw, 38px);
    font-weight: 800;
    line-height: 1.1;
    color: white;
  }
  .wlp .header h1 span { color: ${SAFFRON}; }
  .wlp .header-sub { color: ${SOFT}; font-size: 14px; margin-top: 6px; font-weight: 300; }

  .wlp .stat-row {
    display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;
  }
  .wlp .stat-chip {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex; flex-direction: column; gap: 2px;
    flex: 1; min-width: 120px;
  }
  .wlp .stat-chip .label { font-size: 10px; color: ${SOFT}; text-transform: uppercase; letter-spacing: 1px; }
  .wlp .stat-chip .val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; }
  .wlp .stat-chip .val span { color: ${SAFFRON}; }
  .wlp .stat-chip.goal .val { color: ${GREEN}; }

  .wlp .tabs {
    display: flex; gap: 4px;
    padding: 12px 12px 0;
    background: ${DEEP};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .wlp .tabs::-webkit-scrollbar { display: none; }
  .wlp .tab-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    color: ${SOFT};
    padding: 10px 12px;
    border-radius: 8px 8px 0 0;
    white-space: nowrap;
    transition: all 0.2s;
    border-bottom: 3px solid transparent;
    -webkit-tap-highlight-color: transparent;
  }
  .wlp .tab-btn:hover { color: white; background: rgba(255,255,255,0.05); }
  .wlp .tab-btn.active {
    color: ${SAFFRON};
    border-bottom: 3px solid ${SAFFRON};
    background: rgba(245,166,35,0.07);
  }
  .wlp .tab-btn .emoji { margin-right: 6px; }

  .wlp .content { padding: 16px 14px; max-width: 900px; margin: 0 auto; }
  @media (min-width: 640px) { .wlp .content { padding: 20px 24px; } }

  .wlp .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
    color: white;
    margin: 24px 0 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .wlp .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.08);
  }

  .wlp .card {
    background: ${CARD};
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 14px;
  }
  .wlp .card.accent { border-left: 4px solid ${SAFFRON}; }
  .wlp .card.green { border-left: 4px solid ${GREEN}; }
  .wlp .card.blue { border-left: 4px solid ${BLUE}; }
  .wlp .card.red { border-left: 4px solid ${RED}; }

  .wlp .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    color: ${SAFFRON};
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .wlp .card-title.green { color: ${GREEN}; }
  .wlp .card-title.blue { color: ${BLUE}; }
  .wlp .card-title.red { color: ${RED}; }
  .wlp .card-title.white { color: white; }

  .wlp .row-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 12px; }

  .wlp .macro-box {
    background: rgba(255,255,255,0.04);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .wlp .macro-box .m-val {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    color: ${SAFFRON};
  }
  .wlp .macro-box .m-val.g { color: ${GREEN}; }
  .wlp .macro-box .m-val.b { color: ${BLUE}; }
  .wlp .macro-box .m-label { font-size: 12px; color: ${SOFT}; margin-top: 3px; }
  .wlp .macro-box .m-sub { font-size: 10px; color: rgba(168,178,200,0.6); margin-top: 2px; }

  .wlp .timeline { display: flex; flex-direction: column; gap: 0; }
  .wlp .timeline-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-wrap: wrap;
  }
  .wlp .timeline-item:last-child { border-bottom: none; }
  .wlp .t-time {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    color: ${SAFFRON};
    min-width: 60px;
  }
  .wlp .t-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: ${SAFFRON};
    margin-top: 5px;
    flex-shrink: 0;
  }
  .wlp .t-dot.green { background: ${GREEN}; }
  .wlp .t-dot.blue { background: ${BLUE}; }
  .wlp .t-dot.red { background: ${RED}; }
  .wlp .t-dot.gray { background: ${SOFT}; }
  .wlp .t-text { flex: 1; }
  .wlp .t-title { font-size: 14px; font-weight: 500; color: white; }
  .wlp .t-sub { font-size: 12px; color: ${SOFT}; margin-top: 2px; }
  .wlp .t-kcal {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    color: ${SAFFRON};
    background: rgba(245,166,35,0.1);
    padding: 2px 8px;
    border-radius: 20px;
    white-space: nowrap;
  }

  .wlp .meal-category { margin-bottom: 24px; }
  .wlp .meal-category-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
    color: white;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .wlp .meal-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
  }
  .wlp .meal-badge.lunch { background: rgba(52,152,219,0.2); color: ${BLUE}; }
  .wlp .meal-badge.snack { background: rgba(46,204,113,0.2); color: ${GREEN}; }
  .wlp .meal-badge.dinner { background: rgba(245,166,35,0.2); color: ${SAFFRON}; }
  .wlp .meal-badge.preworkout { background: rgba(231,76,60,0.2); color: ${RED}; }

  .wlp .meal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 10px; }
  .wlp .meal-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .wlp .meal-card:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(245,166,35,0.3);
    transform: translateY(-2px);
  }
  .wlp .meal-card-name {
    font-size: 14px; font-weight: 500; color: white;
    margin-bottom: 6px;
  }
  .wlp .meal-card-meta {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .wlp .meta-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
  }
  .wlp .meta-tag.kcal { background: rgba(245,166,35,0.15); color: ${SAFFRON}; }
  .wlp .meta-tag.protein { background: rgba(46,204,113,0.15); color: ${GREEN}; }
  .wlp .meta-tag.prep { background: rgba(52,152,219,0.15); color: ${BLUE}; }
  .wlp .meta-tag.note { background: rgba(168,178,200,0.1); color: ${SOFT}; }

  .wlp .tip-box {
    background: rgba(245,166,35,0.08);
    border: 1px solid rgba(245,166,35,0.2);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
    display: flex; gap: 10px;
  }
  .wlp .tip-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
  .wlp .tip-text { font-size: 13px; color: ${TEXT}; line-height: 1.6; }
  .wlp .tip-text strong { color: ${SAFFRON}; }

  .wlp .prep-day {
    background: ${CARD};
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 12px;
  }
  .wlp .prep-day-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    color: ${SAFFRON};
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(245,166,35,0.2);
  }
  .wlp .prep-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 13px;
  }
  .wlp .prep-item:last-child { border-bottom: none; }
  .wlp .prep-step {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    color: ${SAFFRON};
    font-size: 12px;
    min-width: 22px;
  }

  .wlp .checklist-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 13px; color: ${TEXT}; line-height: 1.5;
  }
  .wlp .checklist-item:last-child { border-bottom: none; }
  .wlp .check { color: ${GREEN}; font-size: 16px; flex-shrink: 0; }
  .wlp .cross { color: ${RED}; font-size: 16px; flex-shrink: 0; }

  .wlp .notion-block {
    background: ${CARD};
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 10px;
    font-family: 'DM Sans', sans-serif;
  }
  .wlp .notion-block .nb-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    color: white; margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .wlp .nb-field {
    display: flex; gap: 8px;
    padding: 6px 0;
    font-size: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .wlp .nb-key { color: ${SOFT}; min-width: 120px; font-weight: 500; }
  .wlp .nb-val { color: ${TEXT}; }

  .wlp .gym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr)); gap: 10px; }
  .wlp .gym-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 14px;
  }
  .wlp .gym-day { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: ${SAFFRON}; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .wlp .gym-focus { font-size: 14px; font-weight: 500; color: white; margin-bottom: 6px; }
  .wlp .gym-notes { font-size: 12px; color: ${SOFT}; line-height: 1.5; }

  .wlp .progress-bar-wrap { margin: 6px 0; }
  .wlp .progress-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .wlp .progress-label span:first-child { color: ${SOFT}; }
  .wlp .progress-label span:last-child { color: ${SAFFRON}; font-weight: 600; }
  .wlp .progress-track { background: rgba(255,255,255,0.08); border-radius: 10px; height: 8px; overflow: hidden; }
  .wlp .progress-fill { height: 100%; border-radius: 10px; background: linear-gradient(90deg, ${SAFFRON}, #e67e22); }

  .wlp .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin: 2px; }
  .wlp .tag.avoid { background: rgba(231,76,60,0.15); color: ${RED}; }
  .wlp .tag.limit { background: rgba(245,166,35,0.15); color: ${SAFFRON}; }
  .wlp .tag.good { background: rgba(46,204,113,0.15); color: ${GREEN}; }

  .wlp .grocery-section { margin-bottom: 16px; }
  .wlp .grocery-title { font-size: 13px; font-weight: 700; color: ${SAFFRON}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
  .wlp .grocery-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .wlp .grocery-item {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 5px 12px;
    font-size: 12px;
    color: ${TEXT};
  }

  .wlp ::-webkit-scrollbar { width: 6px; height: 6px; }
  .wlp ::-webkit-scrollbar-track { background: transparent; }
  .wlp ::-webkit-scrollbar-thumb { background: rgba(245,166,35,0.3); border-radius: 3px; }
`;

const TABS = [
  { id: "overview", label: "Overview", emoji: "📊" },
  { id: "schedule", label: "Daily Schedule", emoji: "🕐" },
  { id: "meals", label: "Meal Options", emoji: "🍛" },
  { id: "prep", label: "Meal Prep", emoji: "🥘" },
  { id: "gym", label: "Gym Plan", emoji: "💪" },
  { id: "groceries", label: "Groceries", emoji: "🛒" },
  { id: "tracking", label: "Tracking", emoji: "📝" },
];

const lunchMeals = [
  { name: "Rajma Rice Bowl", kcal: 520, protein: "22g", prep: "Batch cook", note: "Add cucumber raita" },
  { name: "Chole Rice Bowl", kcal: 540, protein: "20g", prep: "Batch cook", note: "Squeeze lemon" },
  { name: "Egg Bhurji + Rice", kcal: 490, protein: "26g", prep: "10 min", note: "3 eggs, ½ cup rice" },
  { name: "Masoor Dal + Rice", kcal: 450, protein: "18g", prep: "Batch cook", note: "Add ghee tadka" },
  { name: "Grilled Chicken Rice", kcal: 530, protein: "40g", prep: "Batch cook", note: "Shawarma-style marination" },
  { name: "Palak Chicken + Rice", kcal: 520, protein: "38g", prep: "Batch cook", note: "Use frozen spinach" },
  { name: "Chicken Keema + Rice", kcal: 510, protein: "35g", prep: "15 min", note: "Add peas" },
  { name: "Dal Tadka + Rice + Sabzi", kcal: 500, protein: "19g", prep: "Batch cook", note: "Any sabzi of choice" },
  { name: "Methi Chicken + Rice", kcal: 490, protein: "37g", prep: "Batch cook", note: "Great for digestion" },
  { name: "3-Egg Masala Omelette + Rice", kcal: 480, protein: "25g", prep: "10 min", note: "Add onion, tomato, chilli" },
];

const snackMeals = [
  { name: "Greek Yogurt + Almonds", kcal: 200, protein: "16g", prep: "0 min", note: "Plain, no sugar" },
  { name: "Protein Shake (Whey)", kcal: 150, protein: "25g", prep: "2 min", note: "With water, not milk" },
  { name: "Roasted Chana + Black Coffee", kcal: 180, protein: "10g", prep: "0 min", note: "High satiety" },
  { name: "Apple + Peanut Butter (1 tbsp)", kcal: 190, protein: "5g", prep: "0 min", note: "Curbs sweet cravings" },
  { name: "Paneer Cubes (50g) + Veggies", kcal: 160, protein: "10g", prep: "5 min", note: "Sprinkle chaat masala" },
  { name: "Mixed Nuts (30g)", kcal: 180, protein: "5g", prep: "0 min", note: "Almonds + walnuts" },
  { name: "Banana + Black Coffee", kcal: 100, protein: "1g", prep: "0 min", note: "Good pre-study snack" },
  { name: "Egg White Omelette (2 eggs)", kcal: 100, protein: "14g", prep: "8 min", note: "Very low cal, high protein" },
  { name: "Hummus + Carrot Sticks", kcal: 160, protein: "7g", prep: "5 min", note: "DIY from chole" },
  { name: "Cucumber + Tzatziki", kcal: 100, protein: "6g", prep: "5 min", note: "Light, hydrating" },
];

const preworkoutMeals = [
  { name: "1 Banana", kcal: 100, protein: "1g", prep: "0 min", note: "30 min before gym" },
  { name: "Dates (4 pieces)", kcal: 110, protein: "1g", prep: "0 min", note: "Quick energy spike" },
  { name: "Small Rice + Dal (½ cup)", kcal: 200, protein: "8g", prep: "Reheated", note: "If dinner was early" },
  { name: "Rice Cake + Peanut Butter", kcal: 150, protein: "5g", prep: "2 min", note: "Light on stomach" },
];

const dinnerMeals = [
  { name: "Egg Bhurji (4 eggs) + ½ cup Rice", kcal: 560, protein: "32g", prep: "12 min", note: "Best post-workout" },
  { name: "Grilled Chicken (200g) + Sabzi", kcal: 520, protein: "45g", prep: "15 min", note: "High protein, low carb" },
  { name: "Chicken Tikka + Basmati Rice", kcal: 570, protein: "42g", prep: "Batch cook", note: "Marinate in advance" },
  { name: "Paneer Bhurji (100g) + Rice", kcal: 500, protein: "22g", prep: "12 min", note: "Veg protein option" },
  { name: "Chole + Small Rice + Onion Salad", kcal: 480, protein: "18g", prep: "Reheated", note: "From meal prep" },
  { name: "Rajma + Rice (small)", kcal: 490, protein: "20g", prep: "Reheated", note: "High fiber, filling" },
  { name: "Chicken Soup + ½ cup Rice", kcal: 400, protein: "35g", prep: "20 min", note: "Light recovery meal" },
  { name: "3-Egg Stuffed Omelette + Sweet Potato", kcal: 480, protein: "28g", prep: "15 min", note: "Add spinach, mushroom" },
  { name: "Masoor Dal + Rice + Egg Bhurji", kcal: 520, protein: "30g", prep: "12 min", note: "Triple combo, great macros" },
  { name: "Chicken Stir Fry + ½ cup Rice", kcal: 510, protein: "40g", prep: "15 min", note: "Use frozen veggies for speed" },
];

function MealSection({ title, badge, meals }) {
  return (
    <div className="meal-category">
      <div className="meal-category-title">
        <span>{title}</span>
        <span className={`meal-badge ${badge}`}>{badge === "preworkout" ? "Pre-Workout" : badge}</span>
      </div>
      <div className="meal-grid">
        {meals.map((m, i) => (
          <div key={i} className="meal-card">
            <div className="meal-card-name">{m.name}</div>
            <div className="meal-card-meta">
              <span className="meta-tag kcal">~{m.kcal} kcal</span>
              <span className="meta-tag protein">{m.protein} protein</span>
              <span className="meta-tag prep">⏱ {m.prep}</span>
              {m.note && <span className="meta-tag note">💡 {m.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeightLossApp() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <style>{styles}</style>
      <div className="wlp"><div className="app">
        <div className="header">
          <div className="header-badge">🔥 Fat Loss Protocol</div>
          <h1>Rohan's <span>Weight Loss</span> Masterplan</h1>
          <p className="header-sub">Structured for Berlin office life · Indian diet · 6-day gym split · IF 16:8</p>
          <div className="stat-row">
            <div className="stat-chip">
              <span className="label">Current</span>
              <span className="val"><span>96</span> kg</span>
            </div>
            <div className="stat-chip">
              <span className="label">Height</span>
              <span className="val"><span>178</span> cm</span>
            </div>
            <div className="stat-chip">
              <span className="label">BMI</span>
              <span className="val"><span>30.3</span></span>
            </div>
            <div className="stat-chip goal">
              <span className="label">Target</span>
              <span className="val">80–82 kg</span>
            </div>
            <div className="stat-chip goal">
              <span className="label">Daily Calories</span>
              <span className="val">~1850 kcal</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="emoji">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="content">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div>
              <div className="section-title">Your Numbers</div>
              <div className="row-grid">
                <div className="macro-box">
                  <div className="m-val">1850</div>
                  <div className="m-label">Daily Calories (kcal)</div>
                  <div className="m-sub">~500 deficit from TDEE</div>
                </div>
                <div className="macro-box">
                  <div className="m-val g">150g</div>
                  <div className="m-label">Protein Target</div>
                  <div className="m-sub">Preserve muscle while cutting</div>
                </div>
                <div className="macro-box">
                  <div className="m-val b">180g</div>
                  <div className="m-label">Carbs Target</div>
                  <div className="m-sub">Fuel for gym sessions</div>
                </div>
                <div className="macro-box">
                  <div className="m-val" style={{color:"#9B59B6"}}>60g</div>
                  <div className="m-label">Fat Target</div>
                  <div className="m-sub">Hormone health</div>
                </div>
              </div>

              <div className="section-title">Expected Progress</div>
              <div className="card">
                <div className="progress-bar-wrap">
                  <div className="progress-label"><span>Month 1–2</span><span>–3 to 4 kg</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{width:"25%"}}></div></div>
                </div>
                <div className="progress-bar-wrap" style={{marginTop:"10px"}}>
                  <div className="progress-label"><span>Month 3–4</span><span>–5 to 7 kg total</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{width:"55%"}}></div></div>
                </div>
                <div className="progress-bar-wrap" style={{marginTop:"10px"}}>
                  <div className="progress-label"><span>Month 5–6</span><span>–10 to 14 kg total</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{width:"85%"}}></div></div>
                </div>
                <p style={{fontSize:"12px", color: "#A8B2C8", marginTop:"12px"}}>⚠️ Weight loss is non-linear. Plateaus are normal — trust the process.</p>
              </div>

              <div className="section-title">Should You Do Intermittent Fasting? ✅ YES</div>
              <div className="card accent">
                <div className="card-title">16:8 IF — Your Eating Window: 12:30 PM → 8:30 PM</div>
                <p style={{fontSize:"13px", color: "#E8E8E8", lineHeight:"1.7"}}>
                  Your schedule is <strong style={{color:SAFFRON}}>perfectly built for 16:8 IF</strong>. You leave at 8:30 AM and eat lunch at 12:30 PM — that's your first meal of the day. Your eating window closes at 8:30 PM, which covers your post-gym dinner. This naturally creates a ~16-hour fast overnight and morning.
                </p>
                <div style={{marginTop:"12px", fontSize:"13px", lineHeight:"1.7", color: "#E8E8E8"}}>
                  <strong style={{color:RED}}>⚠️ Hot Chocolate & Coffee Issue:</strong> Regular hot chocolate and lattes break your fast (milk + sugar = calories). <strong style={{color:GREEN}}>Switch to black coffee or plain green tea in the morning.</strong> It tastes odd at first — give it 2 weeks. Your fasting benefits multiply massively.
                </div>
              </div>

              <div className="section-title">Do's & Don'ts</div>
              <div className="card">
                <div className="checklist-item"><span className="check">✅</span><span>Drink 2.5–3L water per day (set reminders on your phone)</span></div>
                <div className="checklist-item"><span className="check">✅</span><span>Black coffee in the morning — perfectly fine during fast</span></div>
                <div className="checklist-item"><span className="check">✅</span><span>Eat protein at every meal — it's your #1 tool for fat loss</span></div>
                <div className="checklist-item"><span className="check">✅</span><span>Sleep 7–8 hours — cortisol from poor sleep stalls weight loss</span></div>
                <div className="checklist-item"><span className="check">✅</span><span>Use a food scale for the first 2 weeks to calibrate your eye</span></div>
                <div className="checklist-item"><span className="cross">❌</span><span>Hot chocolate in the morning (breaks fast, ~200 kcal)</span></div>
                <div className="checklist-item"><span className="cross">❌</span><span>Eating after 8:30 PM unless it's your post-gym meal</span></div>
                <div className="checklist-item"><span className="cross">❌</span><span>Skipping post-workout protein — muscle loss danger zone</span></div>
                <div className="checklist-item"><span className="cross">❌</span><span>Liquid calories: juice, sugary drinks, masala chai with sugar</span></div>
                <div className="checklist-item"><span className="cross">❌</span><span>Restricting too hard (under 1600 kcal) — causes muscle loss</span></div>
              </div>

              <div className="section-title">Coffee Rule ☕</div>
              <div className="card blue">
                <div className="card-title blue">Coffees in the Morning (During Fasting Window)</div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Black coffee</strong> — zero calories, perfect for fasting</span></div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Americano</strong> (no milk, no sugar) — great</span></div>
                <div className="checklist-item" style={{color:SAFFRON}}><span style={{color:SAFFRON}}>⚠️</span><span><strong>Flat white / cappuccino</strong> — only if under 50 kcal, max 1</span></div>
                <div className="checklist-item"><span className="cross">❌</span><span><strong>Hot chocolate, mochas, lattes</strong> — all break the fast</span></div>
                <p style={{fontSize:"12px", color: SOFT, marginTop:"10px"}}>💡 Save hot chocolate as a treat within your eating window (after 12:30 PM)</p>
              </div>
            </div>
          )}

          {/* ── SCHEDULE ── */}
          {tab === "schedule" && (
            <div>
              <div className="section-title">Daily Schedule (Weekday)</div>
              <div className="card">
                <div className="timeline">
                  <div className="timeline-item">
                    <span className="t-time">6:30 AM</span>
                    <div className="t-dot gray"></div>
                    <div className="t-text">
                      <div className="t-title">Wake up · Hydrate</div>
                      <div className="t-sub">500ml water immediately — kickstarts metabolism</div>
                    </div>
                    <span className="t-kcal">0 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">7:00 AM</span>
                    <div className="t-dot gray"></div>
                    <div className="t-text">
                      <div className="t-title">Black Coffee (optional)</div>
                      <div className="t-sub">Boosts fat burning during fasted state. No milk. No sugar.</div>
                    </div>
                    <span className="t-kcal">5 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">8:30 AM</span>
                    <div className="t-dot gray"></div>
                    <div className="t-text">
                      <div className="t-title">Leave for Office</div>
                      <div className="t-sub">Still fasting. Water bottle in hand.</div>
                    </div>
                    <span className="t-kcal">0 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">9–12 PM</span>
                    <div className="t-dot gray"></div>
                    <div className="t-text">
                      <div className="t-title">Office + Black Coffee at work</div>
                      <div className="t-sub">Max 1 Americano (no milk). Keep hydrated with water.</div>
                    </div>
                    <span className="t-kcal">~5 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">12:30 PM</span>
                    <div className="t-dot" style={{background:SAFFRON}}></div>
                    <div className="t-text">
                      <div className="t-title">🍛 MEAL 1 — Break Fast (Lunch)</div>
                      <div className="t-sub">Your biggest, most carb-heavy meal. Rice + protein + veg. Take from meal prep.</div>
                    </div>
                    <span className="t-kcal">~550 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">4:00 PM</span>
                    <div className="t-dot green"></div>
                    <div className="t-text">
                      <div className="t-title">🥜 MEAL 2 — Afternoon Snack</div>
                      <div className="t-sub">Greek yogurt, protein shake, nuts, fruit + PB, roasted chana etc.</div>
                    </div>
                    <span className="t-kcal">~200 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">6:30 PM</span>
                    <div className="t-dot red"></div>
                    <div className="t-text">
                      <div className="t-title">🍌 Pre-Workout Fuel</div>
                      <div className="t-sub">Banana or 4 dates. Fast-digesting carbs only. Eat 45 min before gym.</div>
                    </div>
                    <span className="t-kcal">~100 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">7:30 PM</span>
                    <div className="t-dot blue"></div>
                    <div className="t-text">
                      <div className="t-title">💪 GYM SESSION</div>
                      <div className="t-sub">~60–75 min. Sip water throughout. No pre-workout needed if you had banana.</div>
                    </div>
                    <span className="t-kcal">–300 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">9:00 PM</span>
                    <div className="t-dot" style={{background:SAFFRON}}></div>
                    <div className="t-text">
                      <div className="t-title">🍗 MEAL 3 — Post-Workout Dinner</div>
                      <div className="t-sub">High protein, moderate carbs. Eat within 45 min of finishing gym.</div>
                    </div>
                    <span className="t-kcal">~550 kcal</span>
                  </div>
                  <div className="timeline-item">
                    <span className="t-time">9:30 PM</span>
                    <div className="t-dot gray"></div>
                    <div className="t-text">
                      <div className="t-title">Eating Window Closes</div>
                      <div className="t-sub">No food after this. Water and herbal tea only. Fast begins again.</div>
                    </div>
                    <span className="t-kcal">Fast</span>
                  </div>
                </div>
                <div style={{marginTop:"16px", padding:"12px", background:"rgba(245,166,35,0.08)", borderRadius:"10px"}}>
                  <p style={{fontSize:"12px", color: SOFT, lineHeight:"1.6"}}>
                    📊 <strong style={{color:SAFFRON}}>Daily Total: ~1400 kcal consumed</strong> + ~300 kcal burned at gym = ~1700 net effective intake. Weekly deficit ≈ 3500 kcal ≈ 0.5 kg lost per week. 
                    <br/>💡 On weekends or non-gym days, skip the pre-workout snack and shift dinner earlier (8 PM).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── MEALS ── */}
          {tab === "meals" && (
            <div>
              <div className="tip-box">
                <span className="tip-icon">💡</span>
                <span className="tip-text">
                  <strong>Strategy:</strong> Lunch is your largest, most carb-heavy meal (energy for the day). Dinner is high-protein, moderate carb (post-gym recovery). Snacks bridge the gap. Mix and match freely — variety prevents boredom.
                </span>
              </div>
              <MealSection title="Lunch Options (12:30 PM)" badge="lunch" meals={lunchMeals} />
              <MealSection title="Snack Options (4:00 PM)" badge="snack" meals={snackMeals} />
              <MealSection title="Pre-Workout (6:30 PM)" badge="preworkout" meals={preworkoutMeals} />
              <MealSection title="Post-Workout Dinner (9:00 PM)" badge="dinner" meals={dinnerMeals} />

              <div className="section-title">Smart Substitutions</div>
              <div className="card">
                <div className="checklist-item"><span>🔄</span><span><strong style={{color:SAFFRON}}>Doner kebab craving?</strong> Make home-style chicken with yogurt + cumin + paprika + lemon marination. Grill in pan. Same flavour, 1/3 the calories.</span></div>
                <div className="checklist-item"><span>🔄</span><span><strong style={{color:SAFFRON}}>Nugget craving?</strong> Air-fry or bake chicken pieces with breadcrumbs and spices. ~200 kcal vs 400+ for fast food.</span></div>
                <div className="checklist-item"><span>🔄</span><span><strong style={{color:SAFFRON}}>Rice portion control:</strong> Use a ½ cup measuring cup (dry). That's ~150g cooked rice, ~200 kcal. Fill the rest of the plate with vegetables.</span></div>
                <div className="checklist-item"><span>🔄</span><span><strong style={{color:SAFFRON}}>Chole/Rajma:</strong> Don't add cream or butter. Tomato + onion + spice base only. Still delicious, much healthier.</span></div>
              </div>
            </div>
          )}

          {/* ── MEAL PREP ── */}
          {tab === "prep" && (
            <div>
              <div className="tip-box">
                <span className="tip-icon">⚡</span>
                <span className="tip-text">
                  <strong>The Rule:</strong> Prep twice a week — <strong>Sunday</strong> covers Mon–Wed, <strong>Wednesday evening</strong> covers Thu–Sat. This way food stays fresh and you never cook after gym at 9 PM.
                </span>
              </div>

              <div className="prep-day">
                <div className="prep-day-title">☀️ Sunday Meal Prep (90 min) → Mon, Tue, Wed</div>
                <div className="prep-item"><span className="prep-step">1</span><span>Cook 3 cups dry basmati rice → store in 5 separate meal-prep containers (½ cup each)</span></div>
                <div className="prep-item"><span className="prep-step">2</span><span>Make a big pot of <strong>Chole OR Rajma</strong> (alternate each week) — 4–5 servings</span></div>
                <div className="prep-item"><span className="prep-step">3</span><span>Marinate 600g chicken breast in <strong>yogurt + cumin + paprika + ginger-garlic + lemon</strong> overnight or for 1 hour</span></div>
                <div className="prep-item"><span className="prep-step">4</span><span>Grill/pan-cook the chicken → store in 3 containers (200g each)</span></div>
                <div className="prep-item"><span className="prep-step">5</span><span>Chop vegetables (onion, tomato, capsicum, cucumber) for the week and store in ziplock bags</span></div>
                <div className="prep-item"><span className="prep-step">6</span><span>Hard-set your lunch boxes: <strong>Rice + Chole + chopped salad</strong> for Mon/Tue, <strong>Rice + Chicken + veggies</strong> for Wed</span></div>
              </div>

              <div className="prep-day">
                <div className="prep-day-title">🌙 Wednesday Evening Prep (60 min) → Thu, Fri, Sat</div>
                <div className="prep-item"><span className="prep-step">1</span><span>Cook 2 cups dry rice → store in containers</span></div>
                <div className="prep-item"><span className="prep-step">2</span><span>Make <strong>Masoor Dal</strong> or <strong>Palak Chicken</strong> for the second half of the week</span></div>
                <div className="prep-item"><span className="prep-step">3</span><span>Batch-cook eggs? Not needed if doing bhurji fresh — eggs take only 10 min anytime</span></div>
                <div className="prep-item"><span className="prep-step">4</span><span>Restock snack items: buy Greek yogurt, banana, nuts, roasted chana</span></div>
              </div>

              <div className="section-title">Must-Have Kitchen Tools</div>
              <div className="card green">
                <div className="checklist-item"><span className="check">✅</span><span><strong>Meal prep containers (6–8 pcs)</strong> — glass or BPA-free plastic. Buy them, they're a game changer.</span></div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Food scale (digital)</strong> — calibrate your portions for 2 weeks, then you'll know by eye</span></div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Measuring cup set</strong> — essential for rice portions</span></div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Non-stick pan (24cm)</strong> — for egg bhurji, omelettes, chicken</span></div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Pressure cooker or Instant Pot</strong> — halves dal/legume cooking time</span></div>
                <div className="checklist-item"><span className="check">✅</span><span><strong>Insulated lunch bag</strong> — to carry meal prep to office</span></div>
              </div>

              <div className="section-title">Sample Weekly Meal Map</div>
              <div className="card">
                {[["Monday", "Chole Rice Bowl", "Protein Shake + Almonds", "Egg Bhurji + Rice"],
                  ["Tuesday", "Grilled Chicken Rice", "Greek Yogurt + Banana", "Rajma Rice + Omelette"],
                  ["Wednesday", "Rajma Rice Bowl", "Roasted Chana + Coffee", "Chicken Tikka + Stir Fry Veg"],
                  ["Thursday", "Masoor Dal + Rice + Sabzi", "Apple + Peanut Butter", "Egg Bhurji (4 eggs) + Rice"],
                  ["Friday", "Palak Chicken + Rice", "Protein Shake", "Chicken Soup + ½ Rice"],
                  ["Saturday", "Methi Chicken + Rice", "Nuts + Yogurt", "Paneer Bhurji + Rice"],
                  ["Sunday", "REST DAY — Flexible eating", "Prep day — cook clean!", "Egg Omelette + Sweet Potato"]
                ].map(([day, lunch, snack, dinner], i) => (
                  <div key={i} style={{display:"flex", gap:"12px", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:"12px", flexWrap:"wrap"}}>
                    <span style={{fontFamily:"Syne", fontWeight:700, color:SAFFRON, minWidth:"80px"}}>{day}</span>
                    <span style={{color: BLUE, flex:1, minWidth:"140px"}}>🍛 {lunch}</span>
                    <span style={{color: GREEN, flex:1, minWidth:"140px"}}>🥜 {snack}</span>
                    <span style={{color: TEXT, flex:1, minWidth:"140px"}}>🌙 {dinner}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GYM ── */}
          {tab === "gym" && (
            <div>
              <div className="tip-box">
                <span className="tip-icon">💪</span>
                <span className="tip-text">
                  <strong>6 Days Split:</strong> Prioritise <strong>compound lifts</strong> (squats, deadlifts, bench, rows) — they burn the most calories and build the most muscle. Cardio is secondary when you're eating in a deficit.
                </span>
              </div>

              <div className="section-title">Weekly Gym Split</div>
              <div className="gym-grid">
                {[
                  {day:"Monday", focus:"Chest + Triceps", notes:"Bench Press, Incline DB Press, Cable Flyes, Tricep Pushdown, Skull Crushers"},
                  {day:"Tuesday", focus:"Back + Biceps", notes:"Deadlift, Lat Pulldown, Seated Rows, Pull-ups, Barbell Curls"},
                  {day:"Wednesday", focus:"Legs", notes:"Squats, Leg Press, Romanian Deadlift, Leg Curl, Calf Raises"},
                  {day:"Thursday", focus:"Shoulders + Abs", notes:"Overhead Press, Lateral Raises, Face Pulls, Planks, Cable Crunches"},
                  {day:"Friday", focus:"Upper Body Push", notes:"Incline Bench, Arnold Press, Dips, Chest Flies, Tricep Extensions"},
                  {day:"Saturday", focus:"Full Body / Cardio", notes:"Compound circuit OR 30–40 min moderate cardio (treadmill, elliptical)"},
                  {day:"Sunday", focus:"REST ✨", notes:"Active recovery — walk, stretch. Your body needs to repair to grow."},
                ].map((g, i) => (
                  <div key={i} className="gym-card" style={g.day==="Sunday" ? {opacity:0.6} : {}}>
                    <div className="gym-day">{g.day}</div>
                    <div className="gym-focus">{g.focus}</div>
                    <div className="gym-notes">{g.notes}</div>
                  </div>
                ))}
              </div>

              <div className="section-title">Cardio Strategy</div>
              <div className="card accent">
                <div className="card-title">Don't Overdo Cardio While Cutting</div>
                <div className="checklist-item"><span>📌</span><span>Your calorie deficit + 6x gym is <strong style={{color:SAFFRON}}>already aggressive</strong>. No need to add extra cardio.</span></div>
                <div className="checklist-item"><span>📌</span><span><strong style={{color:SAFFRON}}>Walking 8,000–10,000 steps/day</strong> is your best fat-burning cardio — it's low-impact and doesn't spike hunger.</span></div>
                <div className="checklist-item"><span>📌</span><span>If you want cardio, do it on <strong style={{color:SAFFRON}}>Saturday</strong> (light day) — 30 min brisk walk, elliptical or cycling.</span></div>
                <div className="checklist-item"><span>📌</span><span>Add 10 min of treadmill walking after weight sessions once you're comfortable (month 2+).</span></div>
              </div>

              <div className="section-title">Gym Nutrition Timing</div>
              <div className="card blue">
                <div className="card-title blue">What to Eat Around Training</div>
                <div className="checklist-item"><span>🕕</span><span><strong>6:30 PM</strong> — 1 banana (45 min before gym). Simple carbs = immediate energy.</span></div>
                <div className="checklist-item"><span>💧</span><span><strong>During gym</strong> — water only. Add electrolytes if sweating heavily.</span></div>
                <div className="checklist-item"><span>🕘</span><span><strong>Within 45 min post-gym</strong> — high-protein meal (egg bhurji / chicken) + moderate carbs (rice). This is your <strong style={{color:BLUE}}>anabolic window</strong>.</span></div>
                <div className="checklist-item"><span>💊</span><span><strong>Optional:</strong> Whey protein shake immediately post-gym if you can't eat for 1+ hour after.</span></div>
              </div>
            </div>
          )}

          {/* ── GROCERIES ── */}
          {tab === "groceries" && (
            <div>
              <div className="tip-box">
                <span className="tip-icon">🛒</span>
                <span className="tip-text">
                  <strong>Berlin tip:</strong> REWE, Lidl, and Aldi are great for basics. For Indian staples (chole, rajma, spices, basmati rice), go to Indian/Asian supermarkets like <strong>Asia Pavillon</strong> or Indian shops around Sonnenallee.
                </span>
              </div>

              <div className="card">
                <div className="grocery-section">
                  <div className="grocery-title">🥩 Proteins</div>
                  <div className="grocery-grid">
                    {["Chicken breast (1kg/week)", "Eggs (12–18/week)", "Greek yogurt (plain, 500g)", "Whey protein powder", "Paneer (200g)", "Rajma (canned or dry)", "Chole / Chickpeas", "Masoor dal (red lentil)"].map(i => <div key={i} className="grocery-item">{i}</div>)}
                  </div>
                </div>
                <div className="grocery-section">
                  <div className="grocery-title">🍚 Carbs</div>
                  <div className="grocery-grid">
                    {["Basmati rice (2kg bag)", "Sweet potato (2–3)", "Banana (weekly bunch)", "Dates (small pack)", "Oats (for snacking)"].map(i => <div key={i} className="grocery-item">{i}</div>)}
                  </div>
                </div>
                <div className="grocery-section">
                  <div className="grocery-title">🥦 Vegetables</div>
                  <div className="grocery-grid">
                    {["Spinach (fresh or frozen)", "Tomatoes", "Onions", "Cucumber", "Capsicum / Bell pepper", "Mushrooms", "Broccoli (frozen bag)", "Methi / Fenugreek leaves", "Garlic", "Ginger"].map(i => <div key={i} className="grocery-item">{i}</div>)}
                  </div>
                </div>
                <div className="grocery-section">
                  <div className="grocery-title">🫙 Pantry Staples</div>
                  <div className="grocery-grid">
                    {["Olive oil / Cooking spray", "Cumin seeds", "Coriander powder", "Garam masala", "Red chilli powder", "Turmeric", "Paprika / Kashmiri chilli", "Ginger-garlic paste", "Low-fat yogurt", "Soy sauce (for stir fry)"].map(i => <div key={i} className="grocery-item">{i}</div>)}
                  </div>
                </div>
                <div className="grocery-section">
                  <div className="grocery-title">🥜 Snacks</div>
                  <div className="grocery-grid">
                    {["Almonds (200g bag)", "Roasted chana", "Peanut butter (1 jar)", "Apples", "Walnuts (small pack)"].map(i => <div key={i} className="grocery-item">{i}</div>)}
                  </div>
                </div>
                <div className="grocery-section">
                  <div className="grocery-title">🍵 Drinks</div>
                  <div className="grocery-grid">
                    {["Black coffee (whole beans or Nespresso)", "Green tea bags", "Herbal tea (evening)", "Sparkling water (variety for cravings)"].map(i => <div key={i} className="grocery-item">{i}</div>)}
                  </div>
                </div>
              </div>

              <div className="section-title">Foods to Avoid / Limit</div>
              <div className="card red">
                <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                  <span className="tag avoid">Hot chocolate (daily)</span>
                  <span className="tag avoid">Sugary chai</span>
                  <span className="tag avoid">White bread</span>
                  <span className="tag avoid">Fast food burgers</span>
                  <span className="tag avoid">Fried snacks</span>
                  <span className="tag avoid">Soft drinks</span>
                  <span className="tag avoid">Fruit juice</span>
                  <span className="tag limit">Cream in curry</span>
                  <span className="tag limit">Butter/ghee (limit to 1 tsp)</span>
                  <span className="tag limit">Paneer in large amounts</span>
                  <span className="tag limit">Restaurant food (2x/week max)</span>
                  <span className="tag good">Black coffee ✅</span>
                  <span className="tag good">Eggs ✅</span>
                  <span className="tag good">Chicken ✅</span>
                  <span className="tag good">Legumes ✅</span>
                </div>
              </div>
            </div>
          )}

          {/* ── TRACKING ── */}
          {tab === "tracking" && (
            <div>
              <div className="tip-box">
                <span className="tip-icon">📲</span>
                <span className="tip-text">
                  <strong>Best apps for you:</strong> Use <strong>MyFitnessPal</strong> (free) for calorie/macro tracking and <strong>Notion</strong> for your weekly planner and check-ins. Keep it simple — complexity kills consistency.
                </span>
              </div>

              <div className="section-title">Notion Dashboard Structure</div>
              <div className="notion-block">
                <div className="nb-title">📋 Page 1: Weekly Planner (Table View)</div>
                {[["Column", "Day | Lunch | Snack | Pre-WO | Dinner | Total kcal | Gym Done? | Water (L)"],
                  ["How to use", "Fill in meals at the start of the week from your meal options list"],
                  ["Checkbox", "Mark gym as ✅ or ❌ each day"],
                  ["Weekly note", "Add a note on how you felt, energy levels, cravings"]
                ].map(([k,v], i) => <div key={i} className="nb-field"><span className="nb-key">{k}</span><span className="nb-val">{v}</span></div>)}
              </div>
              <div className="notion-block">
                <div className="nb-title">📉 Page 2: Progress Tracker (Table or Gallery)</div>
                {[["Weigh-in day", "Every Monday morning, same time, before food"],
                  ["Track", "Weight (kg) | Waist (cm) | Energy (1-10) | Notes"],
                  ["Photo", "Monthly progress photo — same lighting, same time (optional but powerful)"],
                  ["Chart", "Notion doesn't chart natively — export to Google Sheets for graph"]
                ].map(([k,v], i) => <div key={i} className="nb-field"><span className="nb-key">{k}</span><span className="nb-val">{v}</span></div>)}
              </div>
              <div className="notion-block">
                <div className="nb-title">🥘 Page 3: Meal Prep Checklist (Repeating Template)</div>
                {[["Sunday tasks", "☐ Cook rice  ☐ Make dal/legume  ☐ Grill chicken  ☐ Chop veggies  ☐ Pack 5 lunch boxes"],
                  ["Wednesday tasks", "☐ Cook rice  ☐ Cook second protein batch  ☐ Restock snacks"],
                  ["Grocery reminder", "Link to your grocery list page"]
                ].map(([k,v], i) => <div key={i} className="nb-field"><span className="nb-key">{k}</span><span className="nb-val">{v}</span></div>)}
              </div>
              <div className="notion-block">
                <div className="nb-title">💊 Page 4: Supplements (Optional)</div>
                {[["Creatine", "5g/day with water. Best proven supplement for gym performance."],
                  ["Whey protein", "Post-workout if daily protein <100g from food"],
                  ["Vitamin D3", "Especially in Berlin winter — most Indians are deficient"],
                  ["Magnesium", "Before bed — helps sleep quality and recovery"],
                  ["Not needed", "Pre-workout, fat burners, BCAAs — save your money"]
                ].map(([k,v], i) => <div key={i} className="nb-field"><span className="nb-key">{k}</span><span className="nb-val">{v}</span></div>)}
              </div>

              <div className="section-title">MyFitnessPal Setup</div>
              <div className="card green">
                <div className="card-title green">Quick Setup Guide</div>
                <div className="checklist-item"><span className="check">1.</span><span>Set goal: <strong>Lose 0.5 kg/week</strong> (aggressive but sustainable)</span></div>
                <div className="checklist-item"><span className="check">2.</span><span>Set calories: <strong>1850 kcal/day</strong> (override the app's suggestion if needed)</span></div>
                <div className="checklist-item"><span className="check">3.</span><span>Track protein first — aim for green on protein every day</span></div>
                <div className="checklist-item"><span className="check">4.</span><span>Log meals <strong>before</strong> eating (prevents overeating)</span></div>
                <div className="checklist-item"><span className="check">5.</span><span>Save your regular meals as "recipes" — log chole rice in one tap</span></div>
                <div className="checklist-item"><span className="check">6.</span><span>Don't stress if you go 100–200 kcal over. Weekly average matters more.</span></div>
              </div>

              <div className="section-title">Weekly Check-In Questions (Every Sunday)</div>
              <div className="card">
                <div className="checklist-item"><span>❓</span><span>Did I hit my gym sessions? (target: 6/6 or at least 5/6)</span></div>
                <div className="checklist-item"><span>❓</span><span>Was my average daily calorie intake below 1900?</span></div>
                <div className="checklist-item"><span>❓</span><span>Did I drink 2.5L+ water most days?</span></div>
                <div className="checklist-item"><span>❓</span><span>Did I sleep 7+ hours at least 5 nights?</span></div>
                <div className="checklist-item"><span>❓</span><span>What was my biggest challenge this week?</span></div>
                <div className="checklist-item"><span>❓</span><span>What will I do differently next week?</span></div>
                <p style={{fontSize:"12px", color: SOFT, marginTop:"10px"}}>📌 Write 2 sentences of reflection each Sunday. Over 3 months, this becomes incredibly motivating to look back on.</p>
              </div>
            </div>
          )}

          <div style={{height:"20px"}}></div>
        </div>
      </div></div>
    </>
  );
}
