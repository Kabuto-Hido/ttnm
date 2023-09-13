const express = require('express')
const mongoose = require("mongoose")
const cors = require('cors')
const authRouter = require('./routes/auth')
const customerRouter = require('./routes/customer')
const accountRouter = require('./routes/account')
const categoryRouter = require('./routes/category')
const discountRouter = require('./routes/discount')
const productRouter = require('./routes/product')
const typeRouter = require('./routes/type')
const articleCategoryRouter = require('./routes/articleCategory')
const articleRouter = require('./routes/article')
const bookingRouter = require('./routes/booking')
const cartRouter = require('./routes/cart')
const employeeRouter = require('./routes/employee')
const menuRouter = require('./routes/menu')
const menuItemRouter = require('./routes/menuItem')
const restaurantRouter = require('./routes/restaurant')
const searchRouter = require('./routes/search')
const orderRouter = require('./routes/order')
const openningScheduleRouter = require('./routes/openning')
const bodyParser = require('body-parser')

require('dotenv').config;

const app = express();


const connectDB = async () =>{
    
    try {
        await mongoose.connect('mongodb+srv://tuananh:tuananhtest@cluster0.oebrgre.mongodb.net/restaurant?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDB connected')
    } catch (error){
        console.log(error.message)
        process.exit(1)
    }
}

connectDB()
app.use(express.json())
app.use(cors())
app.use('/server-app/uploads',express.static('uploads'))


app.use('/api/auth',authRouter)
app.use('/api/customer',customerRouter)
app.use('/api/account',accountRouter)
app.use('/api/category',categoryRouter)
app.use('/api/discount', discountRouter)
app.use('/api/product', productRouter)
app.use('/api/type', typeRouter)
app.use('/api/articleCategory', articleCategoryRouter)
app.use('/api/article', articleRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/cart', cartRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/menu', menuRouter)
app.use('/api/menuItem', menuItemRouter)
app.use('/api/restaurant', restaurantRouter)
app.use('/api/search', searchRouter)
app.use('/api/order', orderRouter)
app.use('/api/opensSchedule', openningScheduleRouter)


const PORT = process.env.PORT ||5000;

app.listen(PORT,console.log(
`Server started on port ${PORT}`));
