import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './SurveyForm.css';

// Supabase接続設定
const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

function SurveyForm() {
  const [message, setMessage] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);

  const emojis = [
    { rating: 5, emoji: '😁' },
    { rating: 4, emoji: '🙂' },
    { rating: 3, emoji: '😐' },
    { rating: 2, emoji: '🙁' },
    { rating: 1, emoji: '😫' }
  ];

  const handleEmojiClick = async (rating) => {
    // ボタンのクリックアニメーション
    setClickedButton(rating);
    setTimeout(() => setClickedButton(null), 300);

    // Supabaseに送信
    const { error } = await supabase.from('survey_results').insert({ rating });

    // エラー時だけメッセージ表示
    if (error) {
      setMessage('Submission failed 😢');
    } else {
      setMessage('');

      // Thank you 表示処理
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
      }, 2000);
    }
  };

  return (
    <div className="survey-form">
      <h1>How was today's food?</h1>

      <div id="buttons">
        {emojis.map(({ rating, emoji }) => (
          <button
            key={rating}
            className={`emoji-button ${clickedButton === rating ? 'clicked' : ''}`}
            onClick={() => handleEmojiClick(rating)}
          >
            {emoji}
          </button>
        ))}
      </div>

      {message && <p id="message">{message}</p>}

      {showThankYou && (
        <div id="thank-you">
          Thank you! ＞👨‍💻
        </div>
      )}
    </div>
  );
}

export default SurveyForm; 