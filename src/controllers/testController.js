import Test from "../models/Test.js";
export const createTest = async (req, res) => {
  try {
    const newTest = new Test(req.body);
    await newTest.save();
    res.status(201).json({ message: "Successfully created" });
  } catch (error) {
    console.log(error);
  }
};
