import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [file, setFile] = useState(null);
  const [policyFile, setPolicyFile] = useState(null);
  const [inputType, setInputType] = useState('');
  const [mode, setMode] = useState('pipeline');
  const [step, setStep] = useState('');
  const [output, setOutput] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setOutput({});
  };

  const handlePolicyChange = (e) => {
  setPolicyFile(e.target.files[0]);
};


  const handleInputTypeChange = (e) => {
    setInputType(e.target.value);
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    setOutput({});
    if (e.target.value === 'pipeline') setStep('');
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('input_type', inputType);
    if (policyFile) {
      formData.append('policy', policyFile);
    }


    try {
      const isPipeline = mode === 'pipeline';

      if (!isPipeline) {
        const stepMap = {
          summarize: 'summarize',
          generate: 'generate_nfr_rules',
          validate: 'validate_compliance',
          remediate: 'remediate',
        };
        if (!step || !stepMap[step]) {
          alert('Please select a valid agent step.');
          setLoading(false);
          return;
        }
        formData.append('step', stepMap[step]);
      }

      const response = await axios.post(
        `http://localhost:8000/${isPipeline ? 'run_pipeline' : 'run_step'}`,
        formData
      );

      setOutput(response.data);
    } catch (error) {
      console.error('Error:', error);
      setOutput({});
    }
    setLoading(false);
  };

  const inputStyle = {
    padding: '0.5rem',
    backgroundColor: '#1f1f1f',
    color: 'white',
    border: '1px solid #ccc',
    width: '260px',
    borderRadius: '4px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '2rem',
        backgroundColor: '#1a1a1a',
        boxShadow: '0 0 20px rgba(255,255,255,0.08)',
        boxSizing: 'border-box',
        maxWidth: '100%',
        margin: '0 auto',
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#facc15',
          marginBottom: '0.5rem'
        }}>
          COMPLIANCE AND REMEDIATION GENERATOR
        </h1>

        <hr style={{
          border: '0',
          height: '2px',
          background: '#facc15',
          width: '100%',
          marginBottom: '2rem',
          borderRadius: '4px'
        }} />

        {/* Mode Selection */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <label>
            <input
              type="radio"
              value="pipeline"
              checked={mode === 'pipeline'}
              onChange={handleModeChange}
            /> Sequential Mode
          </label>
          <label style={{ marginLeft: '2rem' }}>
            <input
              type="radio"
              value="custom"
              checked={mode === 'custom'}
              onChange={handleModeChange}
            /> Custom Mode
          </label>
        </div>
        
        {/* File Upload */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem'
        }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem' }}>Upload BRD Document:</label>
          <input type="file" onChange={handleFileChange} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.3rem' }}>Upload Policy Document (Optional):</label>
          <input type="file" onChange={handlePolicyChange} style={inputStyle} />
        </div>
      </div>


        {/* Dropdowns */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <select value={inputType} onChange={handleInputTypeChange} style={inputStyle}>
            <option value="" disabled hidden>File Type</option>
            <option value="raw">Raw File</option>
            <option value="processed">Processed File</option>
          </select>

          {mode === 'custom' && (
            <select value={step} onChange={(e) => setStep(e.target.value)} style={inputStyle}>
              <option value="" disabled hidden>Select Agent Step</option>
              <option value="summarize">Only Summarize</option>
              <option value="generate">Only Generate NFRs</option>
              <option value="validate">Only Validate</option>
              <option value="remediate">Only Remediate</option>
            </select>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={handleSubmit} style={{
            padding: '0.6rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {loading ? 'Running...' : 'Start Process'}
          </button>
        </div>

        {/* Output Display */}
        {!loading && Object.keys(output).length > 0 && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#111', borderRadius: '8px' }}>
            {output.summary && (
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ color: '#facc15' }}>Summary</h2>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{output.summary}</pre>
              </div>
            )}

            {output.nfr_rules && output.nfr_rules.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ color: '#facc15' }}>NFR Rules</h2>
                {output.nfr_rules.map((r, i) => (
                  <p key={i}>{typeof r === 'string' ? r : r.rule}</p>
                ))}
              </div>
            )}

            {output.compliance_results && output.compliance_results.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ color: '#facc15' }}>Compliance Results</h2>
                {output.compliance_results.map((r, i) => (
                  <p key={i}>
                    <strong>{r.rule}</strong> – <em>{r.status}</em>
                    {r.matched_with && ` (Matched with: ${r.matched_with}, Score: ${r.score})`}
                  </p>
                ))}
              </div>
            )}

            {output.remediation_actions && output.remediation_actions.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ color: '#facc15' }}>Remediation Suggestions</h2>
                {output.remediation_actions.map((action, i) => (
                  <p key={i}>{action}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
