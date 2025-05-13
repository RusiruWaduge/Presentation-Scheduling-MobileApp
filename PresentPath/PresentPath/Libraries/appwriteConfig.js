import { Client, Account, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67dd8453002a601838ad");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
