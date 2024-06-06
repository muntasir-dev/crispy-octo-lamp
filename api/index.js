const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

module.exports = (req, res) => {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../uploads');
        form.keepExtensions = true;
        
        form.parse(req, (err, fields, files) => {
            if (err) {
                res.status(500).send('Error parsing the form');
                return;
            }

            const { name, classRoll, registrationNo, gender } = fields;
            const image = files.image.path;
            
            const doc = new PDFDocument();
            const outputPath = path.join(__dirname, '../uploads/', `${Date.now()}-submission.pdf`);

            doc.pipe(fs.createWriteStream(outputPath));
            doc.fontSize(20).text('Phulbari Government College', { align: 'center' });
            doc.fontSize(16).text('Phulbari, Dinajpur', { align: 'center' });
            doc.moveDown();
            doc.fontSize(24).fillColor('green').text('Assignment on ICT Practical', { align: 'center' });
            doc.moveDown();
            doc.fontSize(20).fillColor('black').text('Submitted By', { align: 'center' });
            doc.moveDown();

            if (fs.existsSync(image)) {
                doc.image(image, { width: 250, height: 250, align: 'center', valign: 'center' });
            }

            doc.moveDown().fontSize(18).text(`Name: ${name}`);
            doc.moveDown().fontSize(18).text(`Class Roll: ${classRoll}`);
            doc.moveDown().fontSize(18).text(`Registration No.: ${registrationNo}`);
            doc.moveDown().fontSize(18).text(`Gender: ${gender}`);
            doc.end();

            doc.on('end', () => {
                res.download(outputPath, 'submission.pdf', (err) => {
                    if (err) {
                        console.error('Error downloading the file:', err);
                        res.status(500).send('Error generating PDF');
                    }
                    fs.unlinkSync(image);
                    fs.unlinkSync(outputPath);
                });
            });
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
