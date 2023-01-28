module.exports = (io) => {
    io.on('connection', () => {
        console.log('new user connected');
    })
}