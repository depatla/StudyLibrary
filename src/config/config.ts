// Import Appwrite SDK
import { Client, Account, Databases, Storage } from "appwrite";

// Initialize Appwrite client
const client = new Client();

// Configure the client
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("676f5d6700385a8299f0"); // Replace with your project ID

// Export typed Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };
