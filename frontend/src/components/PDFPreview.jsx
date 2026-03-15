import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFPreview = ({ fileUrl }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <Document file={fileUrl} loading="Loading PDF preview...">
        <Page pageNumber={1} width={520} />
      </Document>
    </div>
  );
};

export default PDFPreview;
