import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase 設定
const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);






import { displayMostVotedEmoji } from './mostVotedEmoji.js';
// 絵文字結果を表示
displayMostVotedEmoji(supabase);

// ※ここにあなたの円グラフ表示コードも続けて書く





async function fetchLatestDayData() {
  // rating と created_at を取得し、null を除外
  const { data, error } = await supabase
    .from('survey_results')
    .select('created_at, rating')
    .not('rating', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  // 最新日（YYYY-MM-DD）を抽出
  const latestDate = data[0].created_at.slice(0, 10);
  const latestDayRatings = data.filter(d => d.created_at.startsWith(latestDate));

  // rating ごとの集計
  const counts = [1, 2, 3, 4, 5].map(num =>
    latestDayRatings.filter(d => d.rating === num).length
  );

  drawPieChart(counts, latestDate);
}

function drawPieChart(counts, dateLabel) {
  const ctx = document.getElementById('pieChart').getContext('2d');
 new Chart(ctx, {
   type: 'pie',
   data: {
     labels: ['😁', '🙂', '😐', '😕', '😣'],
     datasets: [{
       label: `Ratings for ${dateLabel}`,
       data: counts,
       backgroundColor: ['#a8e6a1', '#4ecbaf', '#66d0f4', '#4fa0f7', '#8c9eff'],
     }]
   },


  options: {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 50
          },
          padding: 30
        }
      },
      tooltip: {
        bodyFont: {
          size: 30
        }
      }
    }
  }



 });

}

fetchLatestDayData();
