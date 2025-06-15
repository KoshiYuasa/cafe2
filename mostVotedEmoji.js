export async function displayMostVotedEmoji(supabase) {
  const emojiMap = {
    1: '😁',
    2: '🙂',
    3: '😐',
    4: '😕',
    5: '😣'
  };

  const commentMap = {
    1: "Today's food is awesome!",
    2: "Today's food is good!",
    3: "Today's food is so-so.",
    4: "Today's food is a bit disappointing...",
    5: "Today's food was bad..."
  };

  const { data, error } = await supabase
    .from('survey_results')
    .select('created_at, rating')
    .not('rating', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    document.getElementById('most-voted-emoji').textContent = 'Error';
    return;
  }

  const latestDate = data[0].created_at.slice(0, 10);
  const latestRatings = data.filter(row => row.created_at.startsWith(latestDate));

  const counts = [0, 0, 0, 0, 0];
  latestRatings.forEach(row => {
    if (row.rating >= 1 && row.rating <= 5) {
      counts[row.rating - 1]++;
    }
  });

  const maxCount = Math.max(...counts);
  const maxIndex = counts.indexOf(maxCount);
  const mostVotedRating = maxIndex + 1;
  const mostVotedEmoji = emojiMap[mostVotedRating];
  const comment = commentMap[mostVotedRating];

  // 上段の絵文字と票数表示
  document.getElementById('most-voted-emoji').textContent =
    ` ${mostVotedEmoji} `;

  // 下段のコメント表示
  document.getElementById('emoji-comment').textContent = comment;
}
