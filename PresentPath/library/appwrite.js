import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67dd8453002a601838ad');

const databases = new Databases(client);

export { client, databases };