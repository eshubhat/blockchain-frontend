import { useState, useContext, useEffect } from "react";
import FileInput from "../components/FileUpload/FileInput";
import FormInput from "../components/FileUpload/FormInput";
import { handleFormSubmit } from "../utils/FormUtils";
import Navbar from "../components/Dashboard/Navbar";
import { FileAccessContext } from "../contexts/FileAccess";
import { pinata } from "../utils/pinataConfig";

function PatientFileUploadForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    patientAddress: "",
    file: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [encryptedKey, setEncryptedKey] = useState("");
  const { currentAccount, uploadRecord } = useContext(FileAccessContext);
  const [isUploadingToBlockchain, setIsUploadingToBlockchain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const data = new FormData();
    data.append("name", formData.username);
    data.append("email", formData.email);
    data.append("patientAddress", formData.patientAddress);
    if (formData.file) {
      data.append("file", formData.file);
    }
    const hospitalId = localStorage.getItem("id");
    data.append("hospitalId", hospitalId);

    try {
      setIsLoading(true);
      const upload = await pinata.upload.file(formData.file);
      setIsLoading(false);
      uploadToBlockchain(upload.IpfsHash);
      console.log(upload);
    } catch (error) {
      setSuccess(true);
      console.log("file upload unsuccessfull", error);
    }

    setSuccess(true);
    setFormData({ username: "", email: "", patientAddress: "", file: null });
    // try {
    //   const response = await handleFormSubmit(data);
    //   // Assuming the API returns an encrypted key for the file
    //   console.log(response);
    //   if (response && response.encryptedKey) {
    //     console.log(response);
    //     uploadToBlockchain(response.encryptedKey);
    //     setEncryptedKey(response.encryptedKey);
    //   } else {
    //     throw new Error("Failed to get encrypted key from backend.");
    //   }
    //   setSuccess(true);
    //   setFormData({ username: "", email: "", patientAddress: "", file: null });
    // } catch (err) {
    //   setError(err.message);
    // }
  };

  // useEffect(() => {
  //   if (encryptedKey && currentAccount && formData.patientAddress) {
  //     uploadToBlockchain();
  //   }
  // }, [encryptedKey, currentAccount, formData.patientAddress]);

  const uploadToBlockchain = async (ipfsHash) => {
    if (!ipfsHash) return;
    console.log("heelo");

    setIsUploadingToBlockchain(true);
    try {
      const record = await uploadRecord({
        fileKey: "", // Assuming encryptedKey serves as fileKey
        patientAddress: formData.patientAddress, // Now using the patient's address from the form
        encryptedPassword: "", // This should come from secure storage or another API call
        reEncryptionKey: "", // Similarly, this needs to be securely managed
        metadata: "", // Convert to string for blockchain
        recordType: "Patient Record", // This can be more specific based on your application
        ipfsHash: ipfsHash, // Since you're not using IPFS, leave empty or handle accordingly
      });
      console.log("Record uploaded to blockchain:", record);
      alert("Record has been uploaded to the blockchain!");
    } catch (error) {
      console.error("Error uploading to blockchain:", error);
      setError(
        "Failed to upload record to blockchain. Check console for details."
      );
    } finally {
      setIsUploadingToBlockchain(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
      }}
    >
      <Navbar name={"File Upload"} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          maxHeight: "60vh",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#333",
            }}
          >
            User Information Form
          </h1>

          {error && (
            <div
              style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "0.75rem",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {success && !isUploadingToBlockchain && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                padding: "0.75rem",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              Form submitted successfully!
            </div>
          )}

          {isUploadingToBlockchain && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                padding: "0.75rem",
                borderRadius: "4px",
                marginBottom: "1rem",
              }}
            >
              Uploading to Blockchain...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Username"
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
              required
            />

            <FormInput
              label="Email"
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />

            <FormInput
              label="Patient Ethereum Address"
              type="text"
              id="patientAddress"
              value={formData.patientAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  patientAddress: e.target.value,
                }))
              }
              required
            />

            <FileInput
              onFileChange={(e) =>
                setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
              }
            />

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                cursor: "pointer",
                marginTop: "1rem",
              }}
              disabled={isUploadingToBlockchain}
            >
              {isUploadingToBlockchain || isLoading ? "Uploading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PatientFileUploadForm;
