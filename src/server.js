import express from 'express'
import cors from 'cors'
import userRouter from './router/user'

const app = express()
const port = 3000

app.use(express.json({ origin: 'http://localhost' }))
app.use(cors())

app.use('/api/user', userRouter)

app.listen(port, () => console.log(`app listening on port ${port}!`))
