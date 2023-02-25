const express = require('express');
const hbs = require('express-handlebars');

const app = express();

app.engine('hbs', hbs.engine({
	extname: 'hbs',
	defaultLayout: false,
	partialsDir: __dirname + '/views/',
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/example1', (req, res) => {
	res.render('example1');
})
app.get('/example2', (req, res) => {
	res.render('example2');
});
app.get('/example3', (req, res) => {
	res.render('example3');
});
app.get('/example4', (req, res) => {
	res.render('example4');
});
app.get('/example4b', (req, res) => {
	res.render('example4b');
});

app.listen(3000, () => {
	console.log('Server listening on port 3000')
});