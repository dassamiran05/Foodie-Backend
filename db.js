import mongoose from 'mongoose'
import colors from 'colors'

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Database server connected ${conn.connection.host}`.bgMagenta.white);
    }catch(error){
        console.log(`Error n mongodb ${error}`.bgRed.white);
    }
}

export default connectDB;