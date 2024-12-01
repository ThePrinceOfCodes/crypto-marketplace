import { Typography, Stack, Box } from "@mui/material";
import { useLocale } from "locale";
import { Dispatch, SetStateAction } from "react";
import ReplyForm from "./ReplyForm";

type ISendReply = {
  onSubmit: (data: {
    response: string;
    push_notification: boolean;
    send_email: boolean;
  }) => void;
  onCancel: () => void;
  error?: null | string;
  content?: string;
  submitLoading: boolean;
  response: IResponse;
  setResponse: Dispatch<SetStateAction<IResponse>>;
  reply?: string;
  inquiryStatus?: string;
  inquiryTitle?: string;
};

type IResponse = {
  id: null | string;
  response: string;
  push_notification: boolean;
  send_email: boolean;
};

const readOnlyStyles = {
  border: "1px solid rgb(243 244 246)",
  padding: 1.2,
  borderRadius: 1,
  backgroundColor: "rgb(243 244 246)",
  minHeight: 42,
};

export default function InquiryNReplyTab({
  onSubmit,
  content,
  submitLoading,
  inquiryStatus,
  onCancel,
  reply,
  inquiryTitle,
}: Readonly<ISendReply>) {
  const { text } = useLocale();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", rowGap: 2, mt: -2 }}>
      <Stack spacing={1}>
        <Typography sx={{ color: "black" }}>
          {text("inquiry_page_column_title")}
        </Typography>
        <Typography sx={readOnlyStyles}>{inquiryTitle}</Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography sx={{ color: "black" }}>
          {text("inquiry_page_title_content")}
        </Typography>
        <Typography sx={readOnlyStyles}>{content}</Typography>
      </Stack>

      {!reply || inquiryStatus !== "completed" ? (
        <ReplyForm
          submitLoading={submitLoading}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      ) : (
        <Stack spacing={1}>
          <Typography>
            {text("inquiry_page_column_action_btn_send_response")}
          </Typography>
          <Typography
            sx={{
              ...readOnlyStyles,
              height: 120,
            }}
          >
            {reply}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
