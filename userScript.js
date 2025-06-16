import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { displayMostVotedEmoji } from './mostVotedEmoji.js';

// Supabase 設定
const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

// 絵文字表示（時間帯対応）
displayMostVotedEmoji(supabase);

// ▼ 時間帯判定関数（EST基準）
function getCurrentSlot() {
  const nowEST = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const mins = nowEST.getHours() * 60 + nowEST.getMinutes();

  if (mins >= 435 && mins <= 629) return 'morning';    // 7:15–10:29
  if (mins >= 630 && mins <= 989) return 'afternoon';  // 10:30–16:29
  if (mins >= 990 && mins <= 1230) return 'evening';   // 16:30–20:30
  return 'other';
}






// 時間帯に応じて <h1> を更新
function updateHeadingByTime() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const headingEl = document.querySelector('h1');

  if (totalMins >= 435 && totalMins <= 629) {
    headingEl.textContent = "Breakfast is";
  } else if (totalMins >= 630 && totalMins <= 989) {
    headingEl.textContent = "Lunch is";
  } else if (totalMins >= 990 && totalMins <= 1230) {
    headingEl.textContent = "Dinner is";
  } else {
    headingEl.textContent = "Outside meal time";
  }
}

updateHeadingByTime(); // 実行



async function fetchTimeSlotData() {
  const slot = getCurrentSlot();

  if (slot === 'other') {
    const ctx = document.getElementById('pieChart').getContext('2d');
    ctx.font = '20px sans-serif';
    ctx.fillText('No survey data available for this time.', 50, 200);
    return;
  }

  const { data, error } = await supabase
    .from('survey_results')
    .select('created_at, rating')
    .not('rating', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    console.error('Error:', error);
    return;
  }

  const todayEST = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });

  const filtered = data.filter(row => {
    const local = new Date(new Date(row.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const dateStr = local.toLocaleDateString('en-US');
    const mins = local.getHours() * 60 + local.getMinutes();

    if (dateStr !== todayEST) return false;

    if (slot === 'morning') return mins >= 435 && mins <= 629;
    if (slot === 'afternoon') return mins >= 630 && mins <= 989;
    if (slot === 'evening') return mins >= 990 && mins <= 1230;

    return false;
  });

  const counts = [1, 2, 3, 4, 5].map(num =>
    filtered.filter(d => d.rating === num).length
  );

  drawPieChart(counts, todayEST, slot);
}

function drawPieChart(counts, dateLabel, slot) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['😣', '😕', '😐', '🙂', '😁'], // 評価1〜5
      datasets: [{
        label: `Ratings for ${dateLabel} (${slot})`,
        data: counts,
        backgroundColor: ['#8c9eff', '#4fa0f7', '#66d0f4', '#4ecbaf', '#a8e6a1'],
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 50 },
            padding: 30
          }
        },
        tooltip: {
          bodyFont: { size: 30 }
        }
      }
    }
  });
}

fetchTimeSlotData();
