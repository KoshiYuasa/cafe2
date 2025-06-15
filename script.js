// Supabase接続設定
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

const buttons = document.querySelectorAll('.emoji-button');
const message = document.getElementById('message');
const thankYou = document.getElementById('thank-you');

buttons.forEach(button => {
  button.addEventListener('click', async () => {
    const rating = Number(button.getAttribute('data-rating'));

    // Supabaseに送信
    const { error } = await supabase.from('survey_results').insert({ rating });

    // エラー時だけメッセージ表示
    if (error) {
      message.textContent = 'Submission failed 😢';
      message.style.display = 'block';
    } else {
      message.textContent = '';
      message.style.display = 'none';

      // ✅ Thank you 表示処理（ここが追加部分）
      thankYou.style.display = 'block';
      setTimeout(() => {
        thankYou.style.display = 'none';
      }, 2000);
    }


    // ボタンを一瞬ポンっと拡大
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 300);
  });
});




