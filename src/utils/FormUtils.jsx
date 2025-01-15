export const handleFormSubmit = async (formData) => {
    try {
      const response = await fetch(`${process.meta.env.APP_URL}/api/fileUpload`, {
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