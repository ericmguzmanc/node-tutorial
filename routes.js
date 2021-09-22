const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.write('<html>');
        res.write('<body>');
        res.write('<form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form>');
        res.write('</body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/message' && method === 'POST') {
        const body = [];
        // ℹ️ listener on req
        req.on('data', chunk => {
            body.push(chunk);
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            fs.writeFile('message.text', message, (error) => {
                // ℹ️ status code 302 is a redirection
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
            });
        });
    }
    res.setHeader('Content-type', 'text/html');
    res.write('<h1>Hello from the Node Server!</h1>');
    res.end();
};

module.exports = requestHandler;

/* ℹ️ You can also export like this
    module.exports = { property, property2 }
    module.exports.property =
    module.exports.property2 =
    exports.property =
    exports.property2 =
* */
