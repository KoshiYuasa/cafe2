import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './SurveyChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Supabase接続設定
const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

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

function SurveyChart() {
  const [chartData, setChartData] = useState(null);
  const [heading, setHeading] = useState('');
  const [mostVotedEmoji, setMostVotedEmoji] = useState('');
  const [emojiComment, setEmojiComment] = useState('');
  const [isOutsideTime, setIsOutsideTime] = useState(false);

  // 時間帯判定関数（EST基準）
  const getCurrentSlot = () => {
    const nowEST = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const mins = nowEST.getHours() * 60 + nowEST.getMinutes();

    if (mins >= 435 && mins <= 629) return 'morning';    // 7:15–10:29
    if (mins >= 630 && mins <= 989) return 'afternoon';  // 10:30–16:29
    if (mins >= 990 && mins <= 1230) return 'evening';   // 16:30–20:30
    return 'other';
  };

  // 時間帯に応じてヘッディングを更新
  const updateHeadingByTime = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const totalMins = now.getHours() * 60 + now.getMinutes();

    if (totalMins >= 435 && totalMins <= 629) {
      setHeading("Today's breakfast is");
    } else if (totalMins >= 630 && totalMins <= 989) {
      setHeading("Today's lunch is");
    } else if (totalMins >= 990 && totalMins <= 1230) {
      setHeading("Today's dinner is");
    } else {
      setHeading("Outside meal time");
    }
  };

  // 最も投票された絵文字を表示
  const displayMostVotedEmoji = async () => {
    const currentSlot = getCurrentSlot();

    if (currentSlot === 'other') {
      setMostVotedEmoji('Outside survey time');
      setEmojiComment('No ratings are collected at this time.');
      setIsOutsideTime(true);
      return;
    }

    const { data, error } = await supabase
      .from('survey_results')
      .select('created_at, rating')
      .not('rating', 'is', null)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setMostVotedEmoji('Error');
      setEmojiComment('');
      return;
    }

    // 今日の日付（EST）
    const todayEST = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' });

    // 時間帯に合致するレコードのみ抽出
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
      setMostVotedEmoji('No data');
      setEmojiComment('No ratings available for this time slot.');
      return;
    }

    // 集計
    const counts = [0, 0, 0, 0, 0];
    filtered.forEach(row => {
      if (row.rating >= 1 && row.rating <= 5) {
        counts[row.rating - 1]++;
      }
    });

    const maxCount = Math.max(...counts);
    const maxIndex = counts.indexOf(maxCount);
    const mostVotedRating = maxIndex + 1;

    // 表示
    setMostVotedEmoji(emojiMap[mostVotedRating]);
    setEmojiComment(commentMap[mostVotedRating]);
  };

  const fetchTimeSlotData = async () => {
    const slot = getCurrentSlot();

    if (slot === 'other') {
      setIsOutsideTime(true);
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

    const chartData = {
      labels: ['😣', '😕', '😐', '🙂', '😁'],
      datasets: [{
        label: `Ratings for ${todayEST} (${slot})`,
        data: counts,
        backgroundColor: ['#8c9eff', '#4fa0f7', '#66d0f4', '#4ecbaf', '#a8e6a1'],
      }]
    };

    setChartData(chartData);
  };

  useEffect(() => {
    updateHeadingByTime();
    displayMostVotedEmoji();
    fetchTimeSlotData();
  }, []);

  return (
    <div className="survey-chart">
      <h1>{heading}</h1>

      <div id="most-voted-emoji" className="most-voted-emoji">
        {mostVotedEmoji}
      </div>
      <div id="emoji-comment" className="emoji-comment">
        {emojiComment}
      </div>

      {!isOutsideTime && chartData && (
        <div className="chart-container">
          <Pie 
            data={chartData}
            options={{
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
            }}
          />
        </div>
      )}

      {isOutsideTime && (
        <div className="no-data-message">
          No survey data available for this time.
        </div>
      )}
    </div>
  );
}

export default SurveyChart; 