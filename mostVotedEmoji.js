export async function displayMostVotedEmoji(supabase) {
  const emojiMap = {
    1: '😣',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😁'
  };

  const commentMap = {
    1: "bad...",
    2: "a bit disappointing...",
    3: "so-so.",
    4: "good!",
    5: "awesome!"
  };

  // ▼ 時間帯を判定（America/New_York）
  function getCurrentSlot() {
    const estNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const totalMins = estNow.getHours() * 60 + estNow.getMinutes();

    if (totalMins >= 435 && totalMins <= 629) return 'morning';   // 7:15–10:29
    if (totalMins >= 630 && totalMins <= 989) return 'afternoon'; // 10:30–16:29
    if (totalMins >= 990 && totalMins <= 1230) return 'evening';  // 16:30–20:30
    return 'other';
  }

  const currentSlot = getCurrentSlot();

  if (currentSlot === 'other') {
    document.getElementById('most-voted-emoji').textContent = 'Outside survey time';
    document.getElementById('emoji-comment').textContent = 'No ratings are collected at this time.';
    return;
  }

  const { data, error } = await supabase
    .from('survey_results')
    .select('created_at, rating')
    .not('rating', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    document.getElementById('most-voted-emoji').textContent = 'Error';
    document.getElementById('emoji-comment').textContent = '';
    return;
  }

  // ▼ 今日の日付（EST）
  const todayEST = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });

  // ▼ 時間帯に合致するレコードのみ抽出
  const filtered = data.filter(row => {
    const local = new Date(new Date(row.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const dateStr = local.toLocaleDateString('en-US');
    const mins = local.getHours() * 60 + local.getMinutes();

    let inSlot = false;
    if (currentSlot === 'morning') inSlot = (mins >= 435 && mins <= 629);
    if (currentSlot === 'afternoon') inSlot = (mins >= 630 && mins <= 989);
    if (currentSlot === 'evening') inSlot = (mins >= 990 && mins <= 1230);

    return dateStr === todayEST && inSlot;
  });

  if (filtered.length === 0) {
    document.getElementById('most-voted-emoji').textContent = 'No data';
    document.getElementById('emoji-comment').textContent = 'No ratings available for this time slot.';
    return;
  }

  // ▼ 集計
  const counts = [0, 0, 0, 0, 0];
  filtered.forEach(row => {
    if (row.rating >= 1 && row.rating <= 5) {
      counts[row.rating - 1]++;
    }
  });

  const maxCount = Math.max(...counts);
  const maxIndex = counts.indexOf(maxCount);
  const mostVotedRating = maxIndex + 1;

  // ▼ 表示
  document.getElementById('most-voted-emoji').textContent = ` ${emojiMap[mostVotedRating]} `;
  document.getElementById('emoji-comment').textContent = commentMap[mostVotedRating];
}
