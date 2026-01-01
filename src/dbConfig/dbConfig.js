import mongoose from "mongoose";
import EventEmitter from "events";

// EventEmitter.defaultMaxListeners = 500;

export async function dbConnect() {
  try {
    await mongoose.connect(String("mongodb+srv://admin:masud1998@cluster0.jt6ubim.mongodb.net/expense_tracker"));

    mongoose.connection.setMaxListeners(20000);

    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Mongodb Connected");
    });
    connection.on("error", (err) => {
      console.log(
        "Mongodb Connection error, please make sure db is up and running" + err
      );
      process.exit();
    });
    // return conn;
  } catch (error) {
    console.log("Something went wrong while connecting the mongodb");
  }
}
