export default function FileInput({ onFileChange }) {
    return (
      <div style={{
        marginBottom: '1rem'
      }}>
        <label 
          htmlFor="file" 
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#333'
          }}
        >
          Upload File
        </label>
        <input
          type="file"
          id="file"
          onChange={onFileChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>
    )
  }