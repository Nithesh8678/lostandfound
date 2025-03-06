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
  submitLostItem: (
    name: string,
    description: string,
    location: string
  ) => Promise<void>;
  submitFoundItem: (
    name: string,
    description: string,
    location: string,
    photo: string
  ) => Promise<void>;
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
  try {
    if (typeof window.ethereum !== "undefined") {
      console.log("Connecting to Ethereum provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Getting signer...");
      const signer = await provider.getSigner();
      console.log("Creating contract instance...");
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Verify contract deployment
      console.log("Verifying contract deployment...");
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        console.error("Contract not deployed at address:", contractAddress);
        return null;
      }

      console.log("Contract connected successfully");
      return contract;
    } else {
      console.error("Please install MetaMask!");
      return null;
    }
  } catch (error) {
    console.error("Error connecting to contract:", error);
    return null;
  }
};

// Function to create IPFS-like hash from item data
const createItemHash = (
  name: string,
  description: string,
  location: string
) => {
  // For now, we'll create a simple concatenated string as a mock IPFS hash
  // In a real implementation, this would upload to IPFS and return a hash
  return Buffer.from(`${name}::${description}::${location}`).toString("base64");
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

    // Create a hash of the item data
    const ipfsHash = createItemHash(name, description, location);

    // Call the contract with just the hash
    const tx = await contract.submitLostItem(ipfsHash);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("Lost item submitted successfully!");
      alert("Lost item submitted successfully!");
      window.location.href = "/dashboard";
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

    // Create a hash of the item data
    const ipfsHash = createItemHash(name, description, location);

    // Call the contract with just the hash
    const tx = await contract.submitFoundItem(ipfsHash);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("Found item submitted successfully!");
      alert("Found item submitted successfully!");
      window.location.href = "/dashboard";
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

// Function to parse item hash back into data
const parseItemHash = (ipfsHash: string) => {
  try {
    const decoded = Buffer.from(ipfsHash, "base64").toString();
    const [name, description, location] = decoded.split("::");
    return { name, description, location };
  } catch (error) {
    console.error("Error parsing item hash:", error);
    return {
      name: "Unknown",
      description: "Error parsing data",
      location: "Unknown",
    };
  }
};

// Function to Fetch Lost Items
export const fetchLostItems = async (): Promise<any[]> => {
  try {
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) return [];

    // Get all items for the current user
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const userItems = await contract.getUserItems(userAddress);

    // Get details for each item
    const items = await Promise.all(
      userItems.map(async (itemId: number) => {
        const item = await contract.items(itemId);
        const { name, description, location } = parseItemHash(item.ipfsHash);

        return {
          id: itemId.toString(),
          name,
          description,
          location,
          date: new Date().toISOString().split("T")[0], // For now using current date
          status: item.isFound ? "found" : "active",
          owner: item.owner,
          finder: item.finder,
        };
      })
    );

    return items;
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return [];
  }
};

// Function to Fetch Found Items
export const fetchFoundItems = async (): Promise<any[]> => {
  try {
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) return [];

    const items = await contract.getFoundItems();
    return items.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      location: item.location,
      date: new Date(item.timestamp * 1000).toISOString().split("T")[0],
      status: item.status,
      photo: item.photo,
    }));
  } catch (error) {
    console.error("Error fetching found items:", error);
    return [];
  }
};

// Function to Fetch All Lost Items (from all users)
export const fetchAllLostItems = async (): Promise<any[]> => {
  try {
    console.log("Connecting to contract...");
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) {
      console.error("Failed to connect to contract");
      return [];
    }

    // Get all items from the contract
    console.log("Getting item count...");
    const itemCount = await contract.itemIdCounter();
    console.log("Total items:", Number(itemCount));

    if (Number(itemCount) <= 1) {
      console.log("No items found");
      return [];
    }

    console.log("Fetching items...");
    const items = await Promise.all(
      Array.from({ length: Number(itemCount) - 1 }, (_, i) => i + 1).map(
        async (itemId) => {
          try {
            console.log(`Fetching item ${itemId}...`);
            const item = await contract.items(itemId);
            const { name, description, location } = parseItemHash(
              item.ipfsHash
            );

            return {
              id: itemId.toString(),
              name,
              description,
              location,
              date: new Date().toISOString().split("T")[0],
              status: item.isFound ? "found" : "active",
              owner: item.owner,
              finder: item.finder,
              reward: "0.5", // Placeholder reward amount
            };
          } catch (error) {
            console.error(`Error fetching item ${itemId}:`, error);
            return null;
          }
        }
      )
    );

    // Filter out any null items from failed fetches
    const validItems = items.filter((item) => item !== null);
    console.log("Successfully fetched items:", validItems.length);
    return validItems;
  } catch (error) {
    console.error("Error in fetchAllLostItems:", error);
    return [];
  }
};
