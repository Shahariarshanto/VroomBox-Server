const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 9000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
// app.use(cors(corsConfig))
// app.options("", cors(corsConfig))
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// MongoDB Connection URL
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_PASS}@cluster0.inncnjw.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // MongoDb Database Collection
    const toyCollection = client.db('toybox').collection('Toys');
    const bannerImageCollection = client.db('imageBox').collection('images');

    // Read Operations Get bannerImageCollection images
    app.get('/banner-images', async (req, res) => {
      const cursor = bannerImageCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    }
    );

    //   Read Operations Get All Toys with Pagination
    app.get('/all-toys', async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skipCount = (page - 1) * limit;
      const totalCount = await toyCollection.countDocuments();
      const totalPages = Math.ceil(totalCount / limit);
      const cursor = toyCollection.find().skip(skipCount).limit(limit);
      const toys = await cursor.toArray();
      res.json({
        toys,
        currentPage: page,
        totalPages,
      });
    });


    //  Operations to Get Data by Email 
    app.get('/toys', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // Operation Read Get Data By Descending Order
    app.get('/toys-descending', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).sort({ _id: -1 }).toArray(); // Sort by _id field in descending order
      res.send(result);
    }
    );

    // Operation Read Get Data By Acceending Order
    app.get('/toys-ascending', async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).sort({ _id: 1 }).toArray(); // Sort by _id field in descending order
      res.send(result);
    }
    );

    // Read Operation By Category
    app.get('/toys-category/:category', async (req, res) => {
      const category = req.params.category;
      const result = await toyCollection.find({ subCategory: category }).limit(6).toArray();
      res.send(result);
    }
    );

    // Send Only pictureUrl by get
    app.get('/toys-picture', async (req, res) => {
      const result = await toyCollection.find().project({ pictureUrl: 1 }).toArray();
      res.send(result);
    }
    );

    // Write Operations Add New Toy
    app.post('/add-toy', async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    // Update Operations Update Toy
    app.patch('/update-toy/:id', async (req, res) => {
      const id = req.params.id;
      const {
        updatedPrice,
        updatedToyName,
        updatedCategory,
        updatedQuantity,
        updatedDescription
      } = req.body;
      console.log(req.body)

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          price: updatedPrice,
          toyName: updatedToyName,
          category: updatedCategory,
          quantity: updatedQuantity,
          description: updatedDescription
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });


    // Delete Operations Delete Toy
    app.delete('/delete-toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Wellcome to vroombox Server!')
}
);

app.listen(port, () => {
  console.log(`vroombox app listening at http://localhost:${port}`)
}
);

