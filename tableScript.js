import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

async function main() {
  const { data, error } = await supabase
    .from('survey_results')
    .select('created_at,rating')
    .not('rating', 'is', null);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  const grouped = {};

  data.forEach(({ created_at, rating }) => {
    const date = new Date(created_at)
      .toLocaleDateString('en-US', { timeZone: 'America/New_York' })
      .replaceAll('/', '-'); // 例: "6/14/2025" → "6-14-2025"

    if (!grouped[date]) {
      grouped[date] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
    grouped[date][rating] += 1;
  });

  const tbody = document.querySelector('#summary-table tbody');

  Object.entries(grouped).forEach(([date, counts]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>${counts[1]}</td>
      <td>${counts[2]}</td>
      <td>${counts[3]}</td>
      <td>${counts[4]}</td>
      <td>${counts[5]}</td>
    `;
    tbody.appendChild(row);
  });
}

main();
