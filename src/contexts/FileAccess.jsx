import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/constants";

const { ethereum } = window;

// Create the context
export const FileAccessContext = createContext();

const getEthereumContractForWrite = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  return contract;
};

const getEthereumContractForRead = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const storage = await provider.getStorage(CONTRACT_ADDRESS, 1);
  console.log("storage", storage);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  return contract;
};

// FileAccessContextProvider component
export const FileAccessContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [recordForm, setRecordForm] = useState({
    patientAddress: "",
    fileKey: "",
    encryptedPassword: "",
    reEncryptionKey: "",
    metadata: "",
    recordType: "",
    ipfsHash: "",
  });

  const [accessRequestForm, setAccessRequestForm] = useState({
    recordId: "",
    purpose: "",
    validityPeriod: "",
  });

  const [userForm, setUserForm] = useState({
    address: "",
    name: "",
    role: "",
    publicKey: "",
    specialization: "",
    location: "",
  });

  const handleRecordFormChange = (e, name) => {
    setRecordForm((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const handleAccessFormChange = (e, name) => {
    setAccessRequestForm((prevState) => ({
      ...prevState,
      [name]: e.target.value,
    }));
  };

  const handleUserFormChange = (e, name) => {
    setUserForm((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const uploadRecord = async ({
    patientAddress,
    metadata,
    recordType,
    ipfsHash,
  }) => {
    try {
      const contract = await getEthereumContractForWrite();

      setIsLoading(true);

      // Validate patientAddress
      if (!ethers.isAddress(patientAddress)) {
        throw new Error("Invalid patient Ethereum address format");
      }

      console.log(
        "patientAddress",
        patientAddress,
        "currentAddress",
        currentAccount
      );

      const tx = await contract.uploadRecord(
        ethers.getAddress(patientAddress), // Ensure the address is checksummed
        metadata,
        currentAccount,
        recordType,
        ipfsHash
      );

      const receipt = await tx.wait();
      console.log("Record upload transaction hash:", tx.hash);
      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Error uploading record:", error);
      throw error;
    }
  };

  const requestAccess = async (recordId, purpose) => {
    try {
      const contract = await getEthereumContractForWrite();
      // const { recordId, purpose, validityPeriod } = accessRequestForm;
      const thirtyDaysInSeconds = 180 * 24 * 60 * 60; // default is set to 6 months(30 days each month)

      setIsLoading(true);
      const formattedTime = ethers.toBigInt(thirtyDaysInSeconds);
      const tx = await contract.requestAccess(
        recordId,
        purpose,
        formattedTime,
        currentAccount
      );
      await tx.wait();

      setIsLoading(false);
      return tx.hash;
    } catch (error) {
      console.error(error);
    }
  };
  const approveAccess = async (requestId, hospitalId) => {
    try {
      const contract = await getEthereumContractForWrite();
      console.log("contract", hospitalId);

      // Validate input parameters
      if (!ethers.isAddress(hospitalId)) {
        throw new Error("Invalid hospital Ethereum address format");
      }

      console.log("Approving access request:", {
        requestId,
        hospitalId,
      });

      setIsLoading(true);

      const tx = await contract.approveAccessRequest(
        ethers.toBigInt(requestId), // Convert requestId to BigInt if needed
        ethers.getAddress(hospitalId), // Ensure the hospital address is checksummed
        currentAccount
      );

      const receipt = await tx.wait();
      console.log("Access approved transaction hash:", tx.hash);

      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Error approving access request:", error);
      throw error;
    }
  };

  const registerUser = async ({
    address,
    name,
    role,
    publicKey,
    specialization,
    location,
  }) => {
    try {
      const contract = await getEthereumContractForWrite();

      console.log("Validated form data:", {
        address,
        name,
        role,
        specialization,
        location,
      });
      // Validate address format
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Ensure we have a checksummed address
      const formattedAddress = ethers.getAddress(address).toLowerCase();

      console.log("Validated form data:", {
        formattedAddress,
        name,
        role,
        specialization,
        location,
      });

      setIsLoading(true);

      const tx = await contract.registerUser(
        formattedAddress,
        name,
        role,
        specialization,
        location
      );

      const receipt = await tx.wait();
      console.log("Transaction hash:", tx.hash);

      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Registration error:", error);
      throw error;
    }
  };

  const registerHospital = async (address, name, specialization, location) => {
    try {
      const contract = await getEthereumContractForWrite();
      // const { address, name, role, publicKey, specialization, location } =
      //   userForm;

      console.log("Validated form data:", {
        address,
        name,
        specialization,
        location,
      });
      // Validate address format
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Ensure we have a checksummed address
      const formattedAddress = ethers.getAddress(address).toLowerCase();

      console.log("Validated form data:", {
        formattedAddress,
        name,
        specialization,
        location,
      });

      setIsLoading(true);

      const tx = await contract.registerHospital(
        formattedAddress,
        name,
        specialization,
        location
      );

      const receipt = await tx.wait();
      console.log("Transaction hash:", tx.hash);

      setIsLoading(false);
      return receipt;
    } catch (error) {
      setIsLoading(false);
      console.error("Registration error:", error);
      throw error;
    }
  };

  const getDocumentsByPatient = async (patientAddress) => {
    const contract = await getEthereumContractForRead();
    const formattedAddress = ethers.getAddress(patientAddress);
    console.log("formatted address", formattedAddress);
    // console.log("contract", contract);
    try {
      const userInfo = await contract.getUserInfo(formattedAddress);
      const record = await contract.getRecordsByPatient(
        formattedAddress,
        currentAccount
      );
      // const record = await contract.getRecordsByPatient();
      console.log("Record:", record, "\nuserInfo", userInfo);
      return { record, userInfo };
    } catch (error) {
      console.error("Error fetching record:", error);
      alert("Error fetching record");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <FileAccessContext.Provider
      value={{
        connectWallet,
        currentAccount,
        isLoading,
        userRole,
        recordForm,
        accessRequestForm,
        userForm,
        handleRecordFormChange,
        handleAccessFormChange,
        handleUserFormChange,
        uploadRecord,
        requestAccess,
        getDocumentsByPatient,
        registerUser,
        registerHospital,
        approveAccess,
      }}
    >
      {children}
    </FileAccessContext.Provider>
  );
};
