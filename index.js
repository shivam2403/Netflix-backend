const express=require('express');
const app=express();
const mongoose=require('mongoose');
const dotenv=require('dotenv')
const authRouter=require('./routes/auth');
const userRouter=require('./routes/users');
const movieRouter=require('./routes/movies');
const listRouter=require('./routes/lists');
const cors=require('cors');


app.use(cors(
    {
        origin: [""],
        methods: ["POST","GET"],
        credentials: true
    }
));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

dotenv.config();
mongoose.connect(process.env.MONGO_URL);

// middleware
app.use(express.json());
app.use('/api/auth',authRouter);
app.use('/api/users',userRouter);
app.use('/api/movies',movieRouter);
app.use('/api/lists',listRouter);

app.listen(process.env.PORT,()=>{
    console.log('Server is listening at port '+process.env.PORT);
})
