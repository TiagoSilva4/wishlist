import React from 'react';

export default function FormErrors (props) {
  console.log('FormErrors component received:', props);
  
  if (!props.errors || !props.errors.length) {
    return null;
  }
  
  // Filter errors based on param
  const errors = props.errors.filter(error => 
    props.param ? error.param === props.param : error.param == null || error.param === 'general'
  );
  
  if (!errors.length) {
    return null;
  }
  
  // Determine error message style based on severity or error type
  const getErrorStyle = (error) => {
    const baseStyle = { 
      margin: '0.5rem 0',
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
      listStyle: 'disc',
    };

    // Customize style based on error type/severity
    if (error.severity === 'warning') {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#92400e'
      };
    } else if (error.param === 'csrf' || (error.message && error.message.includes('session'))) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        color: '#4338ca'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        color: 'darkred'
      };
    }
  };

  return (
    <ul style={getErrorStyle(errors[0])}>
      {errors.map((e, i) => (
        <li key={i}>
          {e.message}
          {e.detail && <div style={{ fontSize: '0.9em', marginTop: '0.25rem' }}>{e.detail}</div>}
        </li>
      ))}
    </ul>
  );
}
