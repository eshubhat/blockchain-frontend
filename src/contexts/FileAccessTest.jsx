import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/constants";

const { ethereum } = window;

// Create the context
export const FileAccessContextTest = createContext();

// Helper function to get the contract
const getEthereumContract = () => {
  const alchemyProvider = new ethers.AlchemyProvider(
    "sepolia",
    "https://eth-sepolia.g.alchemy.com/v2/fwslZEU08gYTZt7a_cNvHv4VaOxx_z33"
  );
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const contractWithSigner = contract.connect(signer);
  return contract;
};

// FileAccessContextProvider component
export const FileAccessTextContextProvider = ({ children }) => {
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

  const uploadRecord = async () => {
    try {
      const contract = getEthereumContract();
      const {
        patientAddress,
        fileKey,
        encryptedPassword,
        reEncryptionKey,
        metadata,
        recordType,
        ipfsHash,
      } = recordForm;

      setIsLoading(true);
      const tx = await contract.uploadRecord(
        fileKey,
        patientAddress,
        encryptedPassword,
        reEncryptionKey,
        metadata,
        recordType,
        ipfsHash
      );
      await tx.wait();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const requestAccess = async () => {
    try {
      const contract = getEthereumContract();
      const { recordId, purpose, validityPeriod } = accessRequestForm;

      setIsLoading(true);
      const tx = await contract.requestAccess(
        recordId,
        purpose,
        validityPeriod
      );
      await tx.wait();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const registerUser = async () => {
    try {
      const contract = getEthereumContract();
      const { address, name, role, publicKey, specialization, location } =
        userForm;

      // const parsedAmount = ethers.utils.parseEther(amount);
      // await ethereum.request({
      //   method: "eth_sendTransaction",
      //   params: [
      //     {
      //       from: currentAccount,
      //       to: publicKey,
      //       gas: "0x5208",
      //     },
      //   ],
      // });

      setIsLoading(true);
      console.log("contract", contract);
      const tx = await contract
        .connect()
        .registerUser(address, name, role, publicKey, specialization, location);
      const receipt = await tx.wait();
      console.log("receipt", tx.hash);
      // const block = await provider.getBlock(receipt.blockNumber);
      setIsLoading(false);
      return block;
    } catch (error) {
      console.error(error);
      return error;
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
    <FileAccessContextTest.Provider
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
        registerUser,
      }}
    >
      {children}
    </FileAccessContextTest.Provider>
  );
};
