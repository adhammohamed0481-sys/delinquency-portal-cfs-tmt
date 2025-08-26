import React, { useState } from 'react';
import './App.css';

// --- [تصحيح نهائي] استيراد كل ملفات JSON مباشرة من مجلد src ---
import data_cd_2023 from './data/Current Delinquancy 2023.json';
import data_cd_2024 from './data/Current Delinquancy 2024.json';
import data_cd_2025 from './data/Current Delinquancy 2025.json';
import data_dg_2024 from './data/D.G 2024.json';
import data_dg_2025 from './data/D.G 2025.json';
import data_insp_2023 from './data/Inspected 2023.json';
import data_insp_2024 from './data/Inspected 2024.json';
import data_insp_2025 from './data/Inspected 2025.json';
import data_sold_2023 from './data/SOLD 2023.json';
import data_sold_2024 from './data/SOLD 2024.json';
import data_sold_2025 from './data/SOLD 2025.json';
import data_exec from './data/Execution.json';
import data_legal from './data/Legal Disputes.json';
import data_neglected from './data/Neglected Export.json';
import data_auction from './data/Auction containers.json';
// ----------------------------------------------------

const ALL_DATA = {
  "Current Delinquancy 2023": data_cd_2023,
  "Current Delinquancy 2024": data_cd_2024,
  "Current Delinquancy 2025": data_cd_2025,
  "D.G 2024": data_dg_2024,
  "D.G 2025": data_dg_2025,
  "Inspected 2023": data_insp_2023,
  "Inspected 2024": data_insp_2024,
  "Inspected 2025": data_insp_2025,
  "SOLD 2023": data_sold_2023,
  "SOLD 2024": data_sold_2024,
  "SOLD 2025": data_sold_2025,
  "Execution": data_exec,
  "Legal Disputes": data_legal,
  "Neglected Export": data_neglected,
  "Auction containers": data_auction,
};

const SHEET_NAMES = Object.keys(ALL_DATA);

// ... بقية كود الواجهة يبقى كما هو بالضبط ...
// (سأقوم بلصقه بالكامل للتأكد من عدم وجود أي مشاكل)

function App() {
  const [activeSheet, setActiveSheet] = useState(SHEET_NAMES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isGlobalSearchActive, setGlobalSearchActive] = useState(false);

  const handleGlobalSearch = () => {
    if (!searchTerm.trim()) {
      setGlobalSearchActive(false);
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = [];
    for (const sheetName in ALL_DATA) {
      const sheetData = ALL_DATA[sheetName];
      const foundRows = sheetData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
      if (foundRows.length > 0) {
        results.push({ sheetName, rows: foundRows });
      }
    }
    setSearchResults(results);
    setGlobalSearchActive(true);
  };
  
  const isSearching = isGlobalSearchActive && searchTerm.trim() !== '';
  const currentSheetData = ALL_DATA[activeSheet] || [];
  const headers = currentSheetData.length > 0 ? Object.keys(currentSheetData[0]) : [];

  return (
    <div className="container">
      <header className="header">
        <h1>Delinquency Portal ( CFS - TMT )</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search all sheets..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim() === '') {
                setGlobalSearchActive(false);
              }
            }}
            onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
            className="search-input"
          />
          <button onClick={handleGlobalSearch} className="search-button">Search</button>
        </div>
      </header>
      <main>
        <nav className="sidebar">
          <h2>Data Categories</h2>
          <ul>
            {SHEET_NAMES.map(sheetName => (
              <li
                key={sheetName}
                className={activeSheet === sheetName ? 'active' : ''}
                onClick={() => {
                  setActiveSheet(sheetName);
                  setGlobalSearchActive(false);
                  setSearchTerm('');
                }}
              >
                {sheetName}
              </li>
            ))}
          </ul>
        </nav>
        <section className="content">
          {isSearching ? (
            <div>
              <h2 className="content-title">Search results for: <span>"{searchTerm}"</span></h2>
              {searchResults.length > 0 ? (
                searchResults.map(({ sheetName, rows }) => (
                  <div key={sheetName} className="search-result-group">
                    <h3>Found in: {sheetName}</h3>
                    <table>
                      <thead>
                        <tr>{Object.keys(rows[0]).map(key => <th key={key}>{key}</th>)}</tr>
                      </thead>
                      <tbody>
                        {rows.map((row, rowIndex) => (
                           <tr key={rowIndex}>
                            {Object.entries(row).map(([key, value], cellIndex) => (
                              <td key={cellIndex}>
                                {key === 'Documents ( Online )' && value && String(value).trim() !== '' ? (
                                  <a href={value} target="_blank" rel="noopener noreferrer">Open Document</a>
                                ) : ( String(value) )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <p>No results found for "{searchTerm}" in any sheet.</p>
              )}
            </div>
          ) : (
            <>
              <h2 className="content-title">Displaying data for: <span>{activeSheet}</span></h2>
              {currentSheetData.length === 0 ? (
                <p>No data is available for this sheet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>{headers.map(key => <th key={key}>{key}</th>)}</tr>
                  </thead>
                  <tbody>
                    {currentSheetData.map((row, rowIndex) => (
                       <tr key={rowIndex}>
                        {headers.map((header, cellIndex) => (
                          <td key={cellIndex}>
                            {header === 'Documents ( Online )' && row[header] && String(row[header]).trim() !== '' ? (
                              <a href={row[header]} target="_blank" rel="noopener noreferrer">Open Document</a>
                            ) : ( String(row[header]) )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;