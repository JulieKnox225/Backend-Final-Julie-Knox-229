const express = require('express');
const app = express();
const db = require('./Config/DBConfig');
require('dotenv').config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(db);
app.use('/', require('./routes/auth/authentication'));
app.use('/', require('./routes/productApiRoutes'));

app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));