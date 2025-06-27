import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './SurveyTable.css';

// Supabase接続設定
const supabase = createClient(
  'https://ahaagaojvegflbqeempu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWFnYW9qdmVnZmxicWVlbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk3MDksImV4cCI6MjA2NTUwNTcwOX0.RaySLFACwU3G3GeIwvBAc-Zw-Ym52q9CaXNdPpQ0w_A'
);

// 時間帯定義（提供時間に準拠）
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

function SurveyTable() {
  const [tableData, setTableData] = useState({
    morning: [],
    afternoon: [],
    evening: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

    // データを配列形式に変換
    const processedData = {
      morning: Object.entries(grouped.morning || {}).map(([date, counts]) => ({
        date,
        counts,
        totalVotes: [1, 2, 3, 4, 5].reduce((sum, key) => sum + counts[key], 0),
        totalScore: [1, 2, 3, 4, 5].reduce((sum, key) => sum + key * counts[key], 0)
      })),
      afternoon: Object.entries(grouped.afternoon || {}).map(([date, counts]) => ({
        date,
        counts,
        totalVotes: [1, 2, 3, 4, 5].reduce((sum, key) => sum + counts[key], 0),
        totalScore: [1, 2, 3, 4, 5].reduce((sum, key) => sum + key * counts[key], 0)
      })),
      evening: Object.entries(grouped.evening || {}).map(([date, counts]) => ({
        date,
        counts,
        totalVotes: [1, 2, 3, 4, 5].reduce((sum, key) => sum + counts[key], 0),
        totalScore: [1, 2, 3, 4, 5].reduce((sum, key) => sum + key * counts[key], 0)
      }))
    };

    setTableData(processedData);
  };

  const getAverageColor = (average) => {
    const avgNum = parseFloat(average);
    if (isNaN(avgNum)) return '#f0f8ff';
    if (avgNum >= 4.5) return '#c8e6c9'; // 緑
    if (avgNum >= 3.5) return '#fff9c4'; // 黄
    return '#ffcdd2'; // 赤
  };

  const renderTable = (data, title) => (
    <div key={title}>
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ date, counts, totalVotes, totalScore }) => {
            const average = totalVotes > 0 ? (totalScore / totalVotes).toFixed(2) : 'N/A';
            return (
              <tr key={date}>
                <td>{date}</td>
                <td>{counts[1]}</td>
                <td>{counts[2]}</td>
                <td>{counts[3]}</td>
                <td>{counts[4]}</td>
                <td>{counts[5]}</td>
                <td style={{ backgroundColor: getAverageColor(average) }}>
                  {average}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="survey-table">
      <h1>Daily Survey Summary</h1>
      {renderTable(tableData.morning, 'Breakfast')}
      {renderTable(tableData.afternoon, 'Lunch')}
      {renderTable(tableData.evening, 'Dinner')}
    </div>
  );
}

export default SurveyTable; 