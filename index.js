const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nkttysn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const subCategoryCollection = client
      .db("toy-bazar")
      .collection("sub_category");
    const toysCollection = client.db("toy-bazar").collection("toy");
    const allToysCollection = client.db("toy-bazar").collection("all-toys");

    app.get("/subCategory/list", async (req, res) => {
      const subCategory = subCategoryCollection.find();
      const result = await subCategory.toArray();
      res.send(result);
    });

    app.get("/toy/list", async (req, res) => {
      const toys = toysCollection.find();
      const result = await toys.toArray();
      res.send(result[0]);
    });

    app.get("/all-toy/list", async (req, res) => {
      const toys = allToysCollection.find();
      const result = await toys.limit(20).toArray();
      res.send(result);
    });

    app.get("/my-toy/list", async (req, res) => {
      const toys = allToysCollection.find();
      const result = await toys.toArray();
      res.send(result);
    });

    app.get("/my-toy/list/asc", async (req, res) => {
      const toys = allToysCollection.find();
      const result = await toys.sort({ price: 1 }).toArray();
      res.send(result);
    });

    app.get("/my-toy/list/desc", async (req, res) => {
      const toys = allToysCollection.find();
      const result = await toys.sort({ price: -1 }).toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-toy", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await allToysCollection.insertOne(toy);
      res.send(result);
    });

    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;

      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          details: updatedToy.details,
        },
      };

      const result = await allToysCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Toy Bazar");
});

app.listen(port, () => {
  console.log(`toy bazar server is running on port: ${port}`);
});
