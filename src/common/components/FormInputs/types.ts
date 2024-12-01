export default interface FileUploadInterface {
    setFile: (args: Blob | File | null) => void,
    setFileUrl: (args: string) => void,
    previewFile: string | null,
    title?: string,
}