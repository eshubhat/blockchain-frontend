export const handleFormSubmit = async (formData) => {
    try {
      const response = await fetch('http://localhost:8080/api/fileUpload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Submission failed')
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(error.message)
    }
  }