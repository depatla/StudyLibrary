// Import Appwrite SDK
import { Client, Account, Databases, Storage } from "appwrite";

// Initialize Appwrite client
const client = new Client();
console.log(process.env);
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject(
    process.env.REACT_APP_PROJECT_ID ? process.env.REACT_APP_PROJECT_ID : ""
  ); // Replace with your project ID

// Export typed Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage };
