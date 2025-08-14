const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create default users if database is empty
    await createDefaultUsers();
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create default demo users if the database is empty
const createDefaultUsers = async () => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('📦 Creating default demo users...');
      
      const defaultUsers = [
        {
          id: 'farmer1',
          username: 'farmer1',
          password: '12345',
          name: 'John Farmer',
          role: 'farmer',
          avatar: '👨‍🌾',
          balance: 2500,
          landOwned: 3,
          description: 'Experienced corn and soybean farmer with 15 years in sustainable agriculture.'
        },
        {
          id: 'farmer2',
          username: 'farmer2',
          password: '12345',
          name: 'Sarah Green',
          role: 'farmer',
          avatar: '👩‍🌾',
          balance: 1800,
          landOwned: 2,
          description: 'Organic vegetable farmer specializing in climate-resistant crop varieties.'
        },
        {
          id: 'farmer3',
          username: 'farmer3',
          password: '12345',
          name: 'Mike Fields',
          role: 'farmer',
          avatar: '👨‍🌾',
          balance: 3200,
          landOwned: 4,
          description: 'Diversified farmer growing grains, legumes, and maintaining livestock operations.'
        },
        {
          id: 'investor1',
          username: 'investor1',
          password: '12345',
          name: 'Alex Chen',
          role: 'investor',
          avatar: '👨‍💼',
          balance: 5000,
          tokensOwned: 150,
          description: 'Agricultural investment specialist with focus on sustainable farming technologies.'
        },
        {
          id: 'investor2',
          username: 'investor2',
          password: '12345',
          name: 'Emily Davis',
          role: 'investor',
          avatar: '👩‍💼',
          balance: 4200,
          tokensOwned: 200,
          description: 'Impact investor passionate about food security and regenerative agriculture.'
        },
        {
          id: 'investor3',
          username: 'investor3',
          password: '12345',
          name: 'David Kim',
          role: 'investor',
          avatar: '👨‍💼',
          balance: 3800,
          tokensOwned: 120,
          description: 'Portfolio manager specializing in agricultural commodities and farmland investments.'
        },
        {
          id: 'investor4',
          username: 'investor4',
          password: '12345',
          name: 'Lisa Wang',
          role: 'investor',
          avatar: '👩‍💼',
          balance: 6500,
          tokensOwned: 300,
          description: 'Venture capitalist investing in agtech startups and sustainable farming initiatives.'
        },
        {
          id: 'investor5',
          username: 'investor5',
          password: '12345',
          name: 'Carlos Rodriguez',
          role: 'investor',
          avatar: '👨‍💼',
          balance: 2900,
          tokensOwned: 85,
          description: 'ESG-focused investor supporting environmentally responsible agricultural practices.'
        }
      ];
      
      await User.create(defaultUsers);
      console.log(`✅ Created ${defaultUsers.length} default users`);
    } else {
      console.log(`ℹ️  Database already has ${userCount} users`);
    }
  } catch (error) {
    console.error('❌ Error creating default users:', error.message);
  }
};

module.exports = connectDB;
