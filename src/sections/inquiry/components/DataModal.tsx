import { Box, Tab, Tabs } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CustomDialog from "@common/components/CustomDialog";
import InquiryNReplyTab from "./InquiryNReplyTab";
import UserInfoTab from "./UserInfoTab";
import ViewImageTab from "./ViewImageTab";

type IInquiryPage = {
  open: boolean;
  onSubmit: (data: {
    response: string;
    push_notification: boolean;
    send_email: boolean;
  }) => void;
  setResponse: Dispatch<SetStateAction<IResponse>>;
  response: IResponse;
  onCancel: () => void;
  error: null | string;
  content: string;
  submitLoading: boolean;
  initialTab: number;
  reply: string;
  inquiryStatus: string;
  userInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  files?: {
    file_name: string;
    file_url?: string;
  }[];
  inquiryTitle: string;
};

type IResponse = {
  id: null | string;
  response: string;
  push_notification: boolean;
  send_email: boolean;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

export default function DataModal({
  open,
  onCancel,
  setResponse,
  onSubmit,
  response,
  error,
  content,
  submitLoading,
  initialTab,
  reply,
  inquiryStatus,
  userInfo,
  files,
  inquiryTitle,
}: Readonly<IInquiryPage>) {
  const [tabValue, setTabValue] = useState(initialTab);
  const handleChange = (
    _event: React.SyntheticEvent | undefined,
    newValue: number,
  ) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setTabValue(initialTab);
  }, [initialTab, open]);

  return (
    <CustomDialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      renderHeader={() => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: '85%'
          }}
        >
          <Tabs value={tabValue} variant="scrollable" scrollButtons={false} onChange={handleChange}>
            <Tab label="User Info" />
            <Tab label="Image" disabled={files && files[0].file_url === ""} />
            <Tab label="Inquiry/Reply" />
          </Tabs>
        </Box>
      )}
    >
      <TabPanel value={tabValue} index={0}>
        <UserInfoTab userInfo={userInfo} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ViewImageTab files={files} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <InquiryNReplyTab
          onCancel={onCancel}
          setResponse={setResponse}
          onSubmit={onSubmit}
          response={response}
          error={error}
          content={content}
          submitLoading={submitLoading}
          reply={reply}
          inquiryStatus={inquiryStatus}
          inquiryTitle={inquiryTitle}
        />
      </TabPanel>
    </CustomDialog>
  );
}
