const express = require('express');
const rangeParser = require('range-parser');
const path = require('path');
const fs = require('fs');

const app = express();

app.get('/download', (req, res) => {
  const filePath = 'xampp.exe'; // Replace with the actual file path

  const file = path.resolve(filePath);
  const filename = path.basename(file);

  const ranges = rangeParser(fs.statSync(file).size, req.headers.range || '');

  if (!ranges) {
    console.log("LLLLLLL")
    res.status(416).send('Range Not Satisfiable'); 
    return;
  }

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  if (ranges.length === 1) {
    const { start, end } = ranges[0];
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', (err) => {
      res.status(500).send('Error reading the file');
    });
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fs.statSync(file).size}`);
    res.setHeader('Content-Length', end - start + 1);
    stream.pipe(res);
  } else {
    const stream = fs.createReadStream(file);
    stream.on('error', (err) => {
      res.status(500).send('Error reading the file');
    });
    res.status(200);
    res.setHeader('Content-Length', fs.statSync(file).size);
    stream.pipe(res);
  }
});

const port = 9000; // Replace with your desired port number
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});