const mongoose = required('express');

const connectDb = async () => {
    try {
        await mongoose.connect("");
        console.log("Datebase connected successfully");
    } catch (error) {
        console.log(error);

    }
}
module.exports = connectDb;
