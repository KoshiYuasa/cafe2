import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import SurveyForm from './components/SurveyForm';
import SurveyChart from './components/SurveyChart';
import SurveyTable from './components/SurveyTable';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<SurveyForm />} />
          <Route path="/chart" element={<SurveyChart />} />
          <Route path="/table" element={<SurveyTable />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
