const express = require('express');
const router = express.Router();
const Pdf = require('../models/pdfModel')

const session = require('express-session');
router.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false }));
const pdfMake = require('../pdfmake/pdfmake');
const vfsFonts = require('../pdfmake/vfs_fonts');
var bodyParser = require("body-parser")

pdfMake.vfs = vfsFonts.pdfMake.vfs
///pdfMake.vfs = vfsFonts.pdfMake.vfs;
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))



router.get('/', async (req, res) => {

    const usr = req.query.username;
    console.log("query");
    console.log(req.query);
    console.log(req.query.username)
    var dataRow = [];
    var bod2 = [[]];
    await Pdf.find({ username: usr }, {}).sort({ dateSubmitted: -1 }).limit(1).exec((err, projects) => {
        const js = projects[0];
        console.log(projects[0])

        if (js.projectType == 'renovare') {

            var bodyData = [];
            var dataRow = [];
            var pretTotalEuro = 0;
            var pretTotalLei;
            dataRow.push({ text: 'Elemente', style: 'tableHeader', colSpan: 1, alignment: 'center' });
            dataRow.push({ text: 'Număr Unități', style: 'tableHeader', colSpan: 1, alignment: 'center' })
            dataRow.push({ text: 'Preț Unitate(EURO)', style: 'tableHeader', colSpan: 1, alignment: 'center' })
            dataRow.push({ text: 'Preț Total(EURO)', style: 'tableHeader', colSpan: 1, alignment: 'center' })
            bodyData.push(dataRow);

            for (var i = 0; i < js.renovationType.lucrare.length; i++) {
                dataRow = [];
                dataRow.push(js.renovationType.lucrare[i]);
                dataRow.push(js.renovationType.nrUnitati[i]);
                dataRow.push(js.renovationType.pretUnitate[i]); //pret/unitate
                dataRow.push(js.renovationType.nrUnitati[i] * js.renovationType.pretUnitate[i]);//pretTotal
                pretTotalEuro += js.renovationType.nrUnitati[i] * js.renovationType.pretUnitate[i];
                bodyData.push(dataRow);

            }

            pretTotalLei = js.valEuro * pretTotalEuro;
            var documentDefinition = {
                content: [

                    { text: 'Proiect Renovare', style: 'header' },
                    `Detalii proiect renovare pentru ${js.username}`,
                    `Renovare: ${js.building}`,
                    `Adresa: ${js.address}`,
                    { text: 'Detalii proiect', style: 'subheader' },
                    {
                        style: 'tableExample',
                        color: '#444',
                        table: {
                            widths: [200, 'auto', 'auto', 'auto'],
                            headerRows: 1,
                            // keepWithHeaderRows: 1,
                            body: bodyData
                        }
                    },
                    { text: 'Preț total', style: 'subheader', alignment: 'right' },
                    { text: `${pretTotalEuro} (EURO)`, style: { bold: true }, alignment: 'right' },
                    { text: `${pretTotalLei} (LEI)`, style: { bold: true }, alignment: 'right' },
                    `Detalii: ${js.details}`,
                    `Data: ${js.dateSubmitted}`
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    // alignment: 'justify'
                }

            }
        }
        else {
            var mansarda;
            var constructie = js.constructionType[0]
            console.log(constructie);
            if (constructie.areMansarda == 'on')
                mansarda = "DA"
            else mansarda = "NU"
            var documentDefinition = {
                content: [

                    { text: 'Proiect Construcție Casă', style: 'header' },
                    `Detalii proiect construcție pentru ${js.username}`,
                    `Adresa: ${js.address}`,
                    { text: 'Detalii proiect', style: 'subheader' },
                    {
                        text: [{ text: 'Structură: ', style: { bold: true } },
                        `${constructie.structura}`]
                    }
                    , {
                        text: [{ text: 'Suprafață: ', style: { bold: true } },
                        `${constructie.suprafata}`]
                    }
                    ,
                    {
                        text: [{ text: 'Număr etaje: ', style: { bold: true } },
                        `${constructie.nrEtaje}`]
                    },
                    {
                        text: [{ text: 'Număr camere: ', style: { bold: true } },
                        `${constructie.nrCamere}`]
                    }
                    , {
                        text: [{ text: 'Număr băi: ', style: { bold: true } },
                        `${constructie.nrBai}`]
                    }
                    ,
                    {
                        text: [{ text: 'Mansardă: ', style: { bold: true } },
                        `${mansarda}`]
                    },
                    { text: 'Plan personal: ', style: { bold: true } }

                //    { image: './img/coloringbook.jpg', alignment: 'left', width: 150 }


                ], styles: {
                
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    // alignment: 'justify'
                }




            }
        }
        const pdfDoc = pdfMake.createPdf(documentDefinition);
        //  console.log(pdfDoc)
        pdfDoc.getBase64((data) => {
            res.writeHead(200,
                {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment;filename="Proiect ' + req.query.username + '.pdf"'
                });

            const download = Buffer.from(data.toString('utf-16'), 'base64');
            res.end(download);
        });
    }).catch(err => { res.send(err) });



});


module.exports = router;