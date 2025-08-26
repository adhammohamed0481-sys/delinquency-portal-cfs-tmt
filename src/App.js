import React, { useState, useEffect } from 'react';
import './App.css';

// قائمة بأسماء الشيتات التي نريد عرضها
const SHEET_NAMES = [
  "Current Delinquancy 2023", "Current Delinquancy 2024", "Current Delinquancy 2025",
  "D.G 2024", "D.G 2025",
  "Inspected 2023", "Inspected 2024", "Inspected 2025",
  "SOLD 2023", "SOLD 2024", "SOLD 2025",
  "Execution", "Legal Disputes", "Neglected Export", "Auction containers"
];

function App() {
  const [allData, setAllData] = useState({});
  const [activeSheet, setActiveSheet] = useState(SHEET_NAMES[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // [جديد] ذاكرة لتخزين نتائج البحث الشامل
  const [searchResults, setSearchResults] = useState([]);
  const [isGlobalSearchActive, setGlobalSearchActive] = useState(false);


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const data = {};
      for (const sheetName of SHEET_NAMES) {
        try {
          const response = await fetch(`/data/${sheetName}.json`);
          if (response.ok) {
            const jsonData = await response.json();
            data[sheetName] = Array.isArray(jsonData) ? jsonData : [];
          } else {
            console.warn(`File not found: ${sheetName}.json`);
            data[sheetName] = [];
          }
        } catch (error) {
          console.error(`Error fetching data for sheet: ${sheetName}`, error);
          data[sheetName] = [];
        }
      }
      setAllData(data);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  // --- [تعديل جذري] وظيفة البحث الشامل ---
  const handleGlobalSearch = () => {
    if (!searchTerm.trim()) {
      setGlobalSearchActive(false);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const results = [];

    // البحث في كل شيت وفي كل صف
    for (const sheetName in allData) {
      const sheetData = allData[sheetName];
      const foundRows = sheetData.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
      
      // إضافة النتائج مع اسم الشيت الذي وجدت فيه
      if (foundRows.length > 0) {
        results.push({ sheetName, rows: foundRows });
      }
    }
    
    setSearchResults(results);
    setGlobalSearchActive(true);
  };
  
  // تحديد البيانات التي سيتم عرضها (إما بيانات الشيت النشط أو نتائج البحث)
  const isSearching = isGlobalSearchActive && searchTerm.trim() !== '';
  const currentSheetData = allData[activeSheet] || [];
  const headers = currentSheetData.length > 0 ? Object.keys(currentSheetData[0]) : [];

  return (
    <div className="container">
      {/* --- [تعديل] تغيير العنوان --- */}
      <header className="header">
        <h1>Delinquency Portal ( CFS - TMT )</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search all sheets..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              // إذا مسح المستخدم مربع البحث، عد إلى العرض العادي
              if (e.target.value.trim() === '') {
                setGlobalSearchActive(false);
              }
            }}
            // تنفيذ البحث عند الضغط على Enter
            onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
            className="search-input"
          />
          <button onClick={handleGlobalSearch} className="search-button">Search</button>
        </div>
      </header>

      <main>
        <nav className="sidebar">
          {/* --- [تعديل] تغيير كلمة Sheets --- */}
          <h2>Data Categories</h2>
          <ul>
            {SHEET_NAMES.map(sheetName => (
              <li
                key={sheetName}
                className={activeSheet === sheetName ? 'active' : ''}
                // عند النقر على فئة، قم بإلغاء البحث الشامل
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
          {loading ? (
            <div className="loading-message">Loading all sheet data, please wait...</div>
          ) : isSearching ? (
            // --- [جديد] عرض نتائج البحث الشامل ---
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
            // --- العرض العادي لبيانات الشيت النشط ---
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