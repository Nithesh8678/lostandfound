import { ethers } from "ethers";
import {
  LOST_AND_FOUND_ADDRESS,
  BOUNTY_ESCROW_ADDRESS,
  DISPUTE_RESOLUTION_ADDRESS,
} from "../config";
import LostAndFoundABI from "../../../blockchain/artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import BountyEscrowABI from "../../../blockchain/artifacts/contracts/BountyEscrow.sol/BountyEscrow.json";
import DisputeResolutionABI from "../../../blockchain/artifacts/contracts/DisputeResolution.sol/DisputeResolution.json";

// TypeScript Interface for Blockchain Contract
interface BlockchainContract {
  submitLostItem: (name: string, description: string, location: string) => Promise<void>;
  submitFoundItem: (name: string, description: string, location: string, photo: string) => Promise<void>;
  claimBounty: (itemId: string) => Promise<void>;
}

// Extend TypeScript's Window interface to include Ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Connect to Ethereum Provider
const getEthereumContract = async (
  contractAddress: string,
  contractABI: any
): Promise<ethers.Contract | null> => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  } else {
    alert("Please install MetaMask!");
    return null;
  }
};

// Function to Submit a Lost Item
export const submitLostItem = async (
  name: string,
  description: string,
  location: string,
  updateState: Function
) => {
  try {
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) return;

    const tx = await contract.submitLostItem(name, description, location);
    const receipt = await tx.wait(); // Wait for confirmation

    if (receipt.status === 1) {
      console.log("Lost item submitted successfully!");
      alert("Lost item submitted successfully!");

      // Update frontend state with the new item or make an API call to fetch updated items
      updateState(); // Call a function to update your state or trigger a UI update

      window.location.href = "/dashboard"; // Redirect to dashboard or update UI
    } else {
      console.error("Transaction failed");
      alert("Failed to submit lost item.");
    }
  } catch (error) {
    console.error("Error submitting lost item:", error);
    alert("An error occurred while submitting the lost item.");
  }
};

// Function to Submit a Found Item
export const submitFoundItem = async (
  name: string,
  description: string,
  location: string,
  photo: string,
  updateState: Function
) => {
  try {
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) return;

    const tx = await contract.submitFoundItem(name, description, location, photo);
    const receipt = await tx.wait(); // Wait for confirmation

    if (receipt.status === 1) {
      console.log("Found item submitted successfully!");
      alert("Found item submitted successfully!");

      // Update frontend state with the new item or make an API call to fetch updated items
      updateState(); // Call a function to update your state or trigger a UI update

      window.location.href = "/dashboard"; // Redirect to dashboard or update UI
    } else {
      console.error("Transaction failed");
      alert("Failed to submit found item.");
    }
  } catch (error) {
    console.error("Error submitting found item:", error);
    alert("An error occurred while submitting the found item.");
  }
};

// Function to Claim Bounty
export const claimBounty = async (itemId: string) => {
  try {
    const contract = await getEthereumContract(
      BOUNTY_ESCROW_ADDRESS,
      BountyEscrowABI.abi
    );
    if (!contract) return;

    const tx = await contract.claimBounty(itemId);
    const receipt = await tx.wait(); // Wait for confirmation

    if (receipt.status === 1) {
      console.log("Bounty claimed successfully!");
      alert("Bounty claimed successfully!");
      window.location.href = "/dashboard"; // Redirect to dashboard or update UI
    } else {
      console.error("Transaction failed");
      alert("Failed to claim bounty.");
    }
  } catch (error) {
    console.error("Error claiming bounty:", error);
    alert("An error occurred while claiming the bounty.");
  }
};
