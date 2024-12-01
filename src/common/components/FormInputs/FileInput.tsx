import React, { ChangeEvent, useRef } from "react";
import { useField } from "formik";
import { Box, Button, FormControl, FormHelperText } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";

interface FileInputProps {
    name: string
    label: string;
    uploadFileText: string,
    errorText?: string
}

const FileInput: React.FC<FileInputProps> = ({ label, uploadFileText, errorText, ...props }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [field, meta, helpers] = useField(props);
    const { value } = field;
    const { setValue } = helpers;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
        setValue(file);
    };

    const handleRemoveFile = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setValue(null);
    };

    const handleButtonClick = () => {
        fileInputRef?.current?.click();
    };

    return (
        <FormControl fullWidth error={meta.touched && Boolean(meta.error)}>
            <label className="block mb-2 text-sm font-medium text-slate-500">
                {label}
            </label>

            <Box display="flex" alignItems="center">
                <Button
                    sx={{
                        borderColor: `${meta.touched && meta.error ? "error.main" : ""}`,
                        "&:hover": {
                            border: `${meta.touched && meta.error ? "1px solid #d32f2f" : ""}`,
                        }
                    }}
                    onClick={handleButtonClick}
                    className="w-full truncate"
                    component="span"
                    variant="outlined"
                    startIcon={!value && <CloudUploadIcon />}
                    endIcon={
                        value && (
                            <CloseIcon onClick={handleRemoveFile} />
                        )
                    }
                >
                    <span className="block overflow-hidden overflow-ellipsis whitespace-nowrap normal-case">
                        {value ? value.name : uploadFileText}
                    </span>
                </Button>
                <input
                    id={props.name}
                    // accept="application/pdf"
                    className="hidden"
                    type="file"
                    onChange={handleChange}
                    ref={fileInputRef}
                />
            </Box>


            {meta.touched && meta.error && (
                <FormHelperText error sx={{ marginLeft: "4px", marginTop: "4px" }}>{errorText}</FormHelperText>
            )}
        </FormControl>
    );
};

export default FileInput;