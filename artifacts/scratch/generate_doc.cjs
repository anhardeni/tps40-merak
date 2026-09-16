const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType, LevelFormat, PageNumber, Footer } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerShading = { fill: "D5E8F0", type: ShadingType.CLEAR };

const doc = new Document({
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 32, bold: true, color: "2E5481" },
              paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 28, bold: true, color: "2E5481" },
              paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 1 } },
        ]
    },
    sections: [{
        properties: {
            page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun("Beacukai Container Integration Docs - Page "), new TextRun({ children: [PageNumber.CURRENT] })]
                    })
                ]
            })
        },
        children: [
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Business Logic Documentation: Container REST Integration")] }),
            new Paragraph({ children: [new TextRun("Target: Beacukai Developer Portal (OpenAPI/JSON)")] }),
            new Paragraph({ children: [new TextRun("Project: realav1_tpsonline")] }),
            new Paragraph({ spacing: { before: 240 }, children: [new TextRun("This document describes the business logic and technical mapping for the new Container (Coarri Discharge) integration module. It is designed to replace/supplement the legacy 2015 SOAP-based PIA implementation.")] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1. Architecture Overview")] }),
            new Paragraph({ children: [new TextRun("The system follows a parallel-track architecture. Legacy documents still use the SOAP-based 'Document' and 'Tangki' tables, while new container-specific data uses the 'kontainer_documents' and 'kontainers' tables. This separation ensures zero regression on existing flows while providing a clean, schema-mapped structure for the REST API.")] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2. Reference Number (ref_number) Specification")] }),
            new Paragraph({ children: [new TextRun("The ref_number is the primary identifier for Beacukai submissions. It follows the format: AAAAYYMMDDNNNNNN")] }),
            new Paragraph({ spacing: { before: 120 }, children: [new TextRun("• AAAA: First 5 characters of the 'kode_tps' (padded if shorter).")] }),
            new Paragraph({ children: [new TextRun("• YYMMDD: The current date of creation.")] }),
            new Paragraph({ children: [new TextRun("• NNNNNN: A daily-resetting 6-digit sequence.")] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3. Data Mapping (Database to JSON)")] }),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [3120, 3120, 3120],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ borders, shading: headerShading, children: [new Paragraph({ children: [new TextRun({ text: "Database Field", bold: true })] })] }),
                            new TableCell({ borders, shading: headerShading, children: [new Paragraph({ children: [new TextRun({ text: "JSON Key (Schema)", bold: true })] })] }),
                            new TableCell({ borders, shading: headerShading, children: [new Paragraph({ children: [new TextRun({ text: "Logic/Format", bold: true })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("ref_number")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("refNumber")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("String (25)")] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("tgl_tiba")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("tanggalTiba")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("dd-MM-yyyy")] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("no_kontainer")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("nomorKontainer")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("Required")] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("bruto")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("bruto")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("Decimal (24, 4)")] })] }),
                        ]
                    }),
                ]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4. Transmission & State Machine")] }),
            new Paragraph({ children: [new TextRun("The system uses a state machine to track the lifecycle of a submission based on HTTP response codes from Beacukai's REST API:")] }),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [2000, 2000, 5360],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ borders, shading: headerShading, children: [new Paragraph({ children: [new TextRun({ text: "HTTP Code", bold: true })] })] }),
                            new TableCell({ borders, shading: headerShading, children: [new Paragraph({ children: [new TextRun({ text: "New Status", bold: true })] })] }),
                            new TableCell({ borders, shading: headerShading, children: [new Paragraph({ children: [new TextRun({ text: "Action Required", bold: true })] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("201/200")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("SUCCESS")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("None. Data accepted.")] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("400")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("REJECTED")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("Manual correction of JSON fields.")] })] }),
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("5xx")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("RETRY_LATER")] })] }),
                            new TableCell({ borders, children: [new Paragraph({ children: [new TextRun("Automated background retry.")] })] }),
                        ]
                    }),
                ]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5. Security & Permissions")] }),
            new Paragraph({ children: [new TextRun("Maintenance teams must ensure the following permissions are present in the 'permissions' table for any new roles:") ] }),
            new Paragraph({ spacing: { before: 120 }, children: [new TextRun("• kontainer.view: View access.")] }),
            new Paragraph({ children: [new TextRun("• kontainer.create/update: Editing draft documents.")] }),
            new Paragraph({ children: [new TextRun("• kontainer.submit: Triggering the BeacukaiRestService.")] }),
        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("C:\\laragon-6.0.0\\www\\realav1_tpsonline\\artifacts\\scratch\\Container_Integration_Logic.docx", buffer);
    console.log("Document created successfully.");
});
