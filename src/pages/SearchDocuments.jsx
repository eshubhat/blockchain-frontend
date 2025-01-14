import { useState, useContext } from "react";
import { FileAccessContext } from "../contexts/FileAccess";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { pinata } from "../utils/pinataConfig";

//import

import Navbar from "../components/Dashboard/Navbar";

const SearchDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isLoading, requestAccess, getDocumentsByPatient, currentAccount } =
    useContext(FileAccessContext);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [userInfo, setUserInfo] = useState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError("");

    try {
      console.log(searchQuery);
      console.log(getDocumentsByPatient);
      const info = await getDocumentsByPatient(searchQuery);

      console.log(info.record);
      setRecords(info.record);
      setUserInfo(info.userInfo);

      // if (!response.ok) {
      //   throw new Error(data.message);
      // }

      // setSearchResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (contentType) => {
    const mimeTypes = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "text/plain": "txt",
      "application/json": "json",
      // Add more MIME types if needed
    };
    return mimeTypes[contentType] || "bin";
  };

  const downloadDocument = async (ipfsHash) => {
    try {
      console.log(new String(ipfsHash));
  
      // Convert the IPFS hash to a gateway URL
      const ipfsUrl = await pinata.gateways.convert(`${ipfsHash}`);
      console.log(ipfsUrl);
  
      // Fetch the content from IPFS
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Get the blob from the response
      const blob = await response.blob();
  
      // Create a download URL from the blob
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pinata-download`; // You can customize the filename here
      document.body.appendChild(a);
      a.click();
  
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
      console.log("File downloaded successfully");
    } catch (error) {
      console.error("Failed to fetch data from IPFS:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }
  };
  

  const openDialog = (documentId) => {
    console.log(documentId);
    setSelectedDocumentId(documentId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setPurpose("");
  };

  const handleRequestAccess = async () => {
    try {
      console.log("documentId", selectedDocumentId);
      console.log("text", purpose);
      const hash = await requestAccess(selectedDocumentId, purpose);
      console.log(hash);
      setIsDialogOpen(false);
      alert("Access request sent successfully!");
    } catch (err) {
      alert("Error requesting access: " + err.message);
    }
  };

  console.log("records Length", currentAccount);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        justifyContent: "start",
      }}
    >
      <Navbar name={"Search Documents"} />
      <div
        style={{
          padding: "24px",
          maxWidth: "80%",
          width: "60%",
          margin: "0 auto",
          outline: "2px solid red",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            Search Patient Documents
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Patient's public key"
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#ccc" : "#007BFF",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {records.length <= 4 && records[3] === undefined && (
            <p style={{ color: "#6b7280", textAlign: "center" }}>
              No results found
            </p>
          )}

          {records[0] !== undefined &&
            Object.values(records[0]).map((recordItem, index) => (
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "white",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  color: "black",
                }}
              >
                <div>
                  <h3 style={{ fontWeight: "600" }}>{userInfo[0]}</h3>
                  <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                    {records[1][index]}
                  </p>
                  <button>Request Access</button>
                </div>

                <div>
                  {records[3][index] ? (
                    <button
                      onClick={() => downloadDocument(records[2][index])}
                      style={{
                        backgroundColor: "#e7f3ff",
                        color: "green",
                        padding: "6px 16px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Download Document
                    </button>
                  ) : records[0].accessRequested ? (
                    <span style={{ color: "orange", fontSize: "14px" }}>
                      Request Pending
                    </span>
                  ) : (
                    records[4][index] !== currentAccount && (
                      <button
                        onClick={() => openDialog(records[0][index])}
                        style={{
                          backgroundColor: "#e7f3ff",
                          color: "#007BFF",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Request Access
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>Request Access</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Purpose of Access"
            type="text"
            fullWidth
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleRequestAccess} color="primary">
            {isLoading ? "Submitting" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SearchDocuments;
