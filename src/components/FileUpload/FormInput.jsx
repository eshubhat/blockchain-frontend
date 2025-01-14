export default function FormInput({ label, type, value, onChange, ...props }) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <label 
          htmlFor={props.id} 
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333'
          }}
        >
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '1rem'
          }}
          {...props}
        />
      </div>
    )
  }