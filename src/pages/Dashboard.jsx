import React, { useContext, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

import Navbar from "../components/Dashboard/Navbar";
import SearchDocuments from "./SearchDocuments";
import { FileAccessContext } from "../contexts/FileAccess";

const Dashboard = () => {
  const { currentAccount, connectWallet, registerUser, registerHospital } =
    useContext(FileAccessContext);

  const [userDetails, setUserDetails] = useState({
    name: "",
    location: "",
    specialization: "", // For doctors/hospitals
    publicKey: "",
    role: "patient",
  });

  const [isRegistering, setIsRegistering] = useState(false);

  const handleInputChange = (e, field) => {
    setUserDetails((prevState) => ({
      ...prevState,
      [field]: e.target.value,
    }));
  };

  const handleRoleChange = (event) => {
    setUserDetails((prevState) => ({
      ...prevState,
      role: event.target.value,
    }));
  };

  const handleRegister = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setIsRegistering(true);

      const { name, location, specialization, publicKey, role } = userDetails;
      console.log("currentUser", currentAccount);

      if (role === "hospital") {
        // Register hospital
        const tx = await registerHospital(
          publicKey, // This should be the hospital's address, might need admin privileges in your context
          name,
          specialization,
          location
        );
        console.log("tx", tx);
        alert("Hospital registered successfully on the blockchain!");
      } else {
        // Register user (patient or other roles)
        const block = await registerUser({
          address: currentAccount,
          name,
          role,
          publicKey,
          specialization: role === "hospital" ? "" : specialization, // Adjust specialization based on role
          location,
        });
        console.log("block", block);
        alert(`User registered successfully as ${role}!`);
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register. Check the console for details.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Navbar name={"Dashboard"} />

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        {/* Connect Wallet Section */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end" }}>
          {!currentAccount ? (
            <Button variant="contained" color="primary" onClick={connectWallet}>
              Connect Wallet
            </Button>
          ) : (
            <Typography variant="h6">
              Wallet Connected: {currentAccount.slice(0, 6)}...
              {currentAccount.slice(-4)}
            </Typography>
          )}
        </Box>

        {/* User Registration Form */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Register User
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Role</FormLabel>
                <RadioGroup
                  aria-label="role"
                  name="role"
                  value={userDetails.role}
                  onChange={handleRoleChange}
                >
                  <FormControlLabel
                    value="patient"
                    control={<Radio />}
                    label="Patient"
                  />
                  <FormControlLabel
                    value="hospital"
                    control={<Radio />}
                    label="Hospital"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                variant="outlined"
                value={userDetails.name}
                onChange={(e) => handleInputChange(e, "name")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                fullWidth
                variant="outlined"
                value={userDetails.location}
                onChange={(e) => handleInputChange(e, "location")}
              />
            </Grid>
            {userDetails.role !== "patient" && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Specialization"
                  fullWidth
                  variant="outlined"
                  value={userDetails.specialization}
                  onChange={(e) => handleInputChange(e, "specialization")}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Public Key"
                fullWidth
                variant="outlined"
                value={userDetails.publicKey}
                onChange={(e) => handleInputChange(e, "publicKey")}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRegister}
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Cards */}
        {/* ... (rest of the component remains unchanged) */}
      </Container>
    </Box>
  );
};

export default Dashboard;
