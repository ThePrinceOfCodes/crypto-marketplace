import { toast } from "react-toastify";
// import { utils, writeFile } from "xlsx";
import { utils, writeFile } from "xlsx-js-style";

export const jsonToExcelDownload = (
  arrOfObj: any[] | undefined,
  fileName: string,
  skipHeader?: boolean,
  outputExtension?: string,
) => {
  try {
    if (arrOfObj && arrOfObj.length) {
      const headerStyles = {
        font: {
          bold: true,
        },
        border: {
          bottom: { style: "thin", color: "black" },
          top: { style: "thin", color: "black" },
          right: { style: "thin", color: "black" },
        },
      };
      const borderStyles = {
        border: {
          bottom: { style: "thin", color: "black" },
          right: { style: "thin", color: "black" },
        },
      };
      const arrOfArr = arrOfObj.map((elem) => Object.values(elem));
      const headsArrOfArr = Object.keys(arrOfObj[0]);
      !skipHeader && arrOfArr.unshift(headsArrOfArr);

      const ws = utils.aoa_to_sheet(arrOfArr);

      ws["!cols"] = ws["!cols"] || [];
      const range = utils.decode_range(ws["!ref"]!);

      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 0;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell_address = { c: C, r: R };
          const cell_ref = utils.encode_cell(cell_address);

          const cell = ws[cell_ref];

          if (cell && cell.v !== undefined && cell.v !== null) {
            const cellContentLength = String(cell.v).length + 2;
            if (cellContentLength > maxWidth) {
              maxWidth = cellContentLength;
            }
            if (R === 0) {
              cell.s = headerStyles;
            }
            if (R !== 0) {
              cell.s = borderStyles;
            }
          }
        }
        ws["!cols"].push({ wch: maxWidth });
      }

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Sheet 1");
      writeFile(wb, `${fileName}${outputExtension || ".xlsx"}`);
      toast.success("Download successful");
    } else {
      toast.error("No data Provided");
    }
  } catch (error: any) {
    toast.error(
      JSON.stringify(
        error.message || "An error occurred while exporting to Excel",
      ),
    );
  }
};
