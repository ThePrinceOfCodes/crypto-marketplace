"use client";
import { Button } from "@mui/material";
import { useLocale } from "locale";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const PDFView = ({ file }: { file: string }) => {
  const [numPages, setNumPages] = useState<null | number>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const { text } = useLocale();

  return (
    <div className=" border-1 border-solid border-gray-300 mx-auto my-8">
      <div className="h-[400px] w-[550px] overflow-auto">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page width={500} pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="mb-4 flex mt-4 justify-between items-center">
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={pageNumber === 1}
        >
          {text("users_view_files_previous_page")}
        </Button>

        <p className="text-center flex-1">
          {text("users_view_files_page")} {pageNumber}{" "}
          {text("users_view_files_of")} {numPages}
        </p>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={pageNumber === numPages}
        >
          {text("users_view_files_next_page")}
        </Button>
      </div>
    </div>
  );
};

export default PDFView;
