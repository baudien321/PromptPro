const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  
  if (!uri || !dbName) {
    console.error('Please make sure MONGODB_URI and MONGODB_DB are set in .env.local');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    
    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);
    
    // Check and create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Existing collections:', collectionNames);
    
    const requiredCollections = ['prompts', 'users', 'teams', 'collections', 'comments'];
    
    for (const collName of requiredCollections) {
      if (!collectionNames.includes(collName)) {
        console.log(`Creating collection: ${collName}`);
        await db.createCollection(collName);
      } else {
        console.log(`Collection ${collName} already exists`);
      }
    }
    
    // Create a sample prompt if prompts collection is empty
    const promptsCount = await db.collection('prompts').countDocuments();
    if (promptsCount === 0) {
      console.log('Creating a sample prompt...');
      await db.collection('prompts').insertOne({
        title: 'Sample Prompt',
        content: 'This is a sample prompt to test the application.',
        description: 'A sample prompt for testing',
        tags: ['sample', 'test'],
        aiPlatform: 'ChatGPT',
        visibility: 'public',
        rating: 0,
        usageCount: 0,
        successRate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Sample prompt created!');
    } else {
      console.log(`Found ${promptsCount} existing prompts`);
    }
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.close();
  }
}

setupDatabase(); 