import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

// 📌 朝昼晩の時間帯定義（提供時間に準拠）
function getTimeSlotInEST(createdAt) {
  const estTime = new Date(
    new Date(createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })
  );
  const hour = estTime.getHours();
  const minute = estTime.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes >= 435 && totalMinutes <= 629) return 'morning';   // 7:15–10:29
  if (totalMinutes >= 630 && totalMinutes <= 989) return 'afternoon'; // 10:30–16:29
  if (totalMinutes >= 990 && totalMinutes <= 1230) return 'evening';  // 16:30–20:30

  return 'other'; // 対象外（深夜など）
}

const slotTables = {
  morning: document.querySelector('#morning-table tbody'),
  afternoon: document.querySelector('#afternoon-table tbody'),
  evening: document.querySelector('#evening-table tbody')
};

async function main() {
  const { data, error } = await supabase
    .from('survey_results')
    .select('created_at, rating')
    .not('rating', 'is', null);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  const grouped = {};

  data.forEach(({ created_at, rating }) => {
    const timeSlot = getTimeSlotInEST(created_at);
    if (timeSlot === 'other') return;

    const dateInEST = new Date(
      new Date(created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })
    );
    const date = dateInEST.toLocaleDateString('en-US').replaceAll('/', '-');

    if (!grouped[timeSlot]) grouped[timeSlot] = {};
    if (!grouped[timeSlot][date]) grouped[timeSlot][date] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    grouped[timeSlot][date][rating]++;
  });

  // 時間帯別テーブルに描画
  Object.entries(grouped).forEach(([slot, records]) => {
    const tbody = slotTables[slot];

    Object.entries(records).forEach(([date, counts]) => {
      const totalVotes = [1, 2, 3, 4, 5].reduce((sum, key) => sum + counts[key], 0);
      const totalScore = [1, 2, 3, 4, 5].reduce((sum, key) => sum + key * counts[key], 0);
      const average = totalVotes > 0 ? (totalScore / totalVotes).toFixed(2) : 'N/A';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td>${counts[1]}</td>
        <td>${counts[2]}</td>
        <td>${counts[3]}</td>
        <td>${counts[4]}</td>
        <td>${counts[5]}</td>
        <td>${average}</td>
      `;

      const avgCell = row.querySelector('td:last-child');
      const avgNum = parseFloat(average);
      if (!isNaN(avgNum)) {
        if (avgNum >= 4.5) {
          avgCell.style.backgroundColor = '#c8e6c9'; // 緑
        } else if (avgNum >= 3.5) {
          avgCell.style.backgroundColor = '#fff9c4'; // 黄
        } else {
          avgCell.style.backgroundColor = '#ffcdd2'; // 赤
        }
      }

      tbody.appendChild(row);
    });
  });
}

main();
