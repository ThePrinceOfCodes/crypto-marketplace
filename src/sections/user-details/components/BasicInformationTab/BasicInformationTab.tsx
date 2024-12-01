import { formatNumberWithCommas, convertToYYYYMMDD } from "@common/utils/formatters";
import { isSuperSaveUser } from "@common/utils/helpers";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  CheckCommitmentInfoModal,
  CheckCommitmentInfoModalRef,
  CheckReferralInfoModal,
  CheckReferralInfoModalRef,
  CheckOwnershipTransferHistoryModal,
  CheckOwnershipTransferHistoryModalRef,
  CheckCommunityHistoryDialog,
  CommunityHistoryDialogRef,
} from "@sections/user-details/components";
import Image from "next/image";
import React, { useRef, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  CheckConsentHistoryModalRef,
  CheckConsentHistoryModal,
} from "../CheckConsentHistoryModal";
import { AirdropHistoryModelRef, AirdropHistoryModel } from "../AirdropHistory";
import BankChangeModal, {
  BankChangeModalFormType,
} from "@common/components/BankChangeModal/BankChangeModal";

import {
  ViewBankChangeModal,
  ViewBankChangeModalRef,
} from "@common/components/ViewBankChangeModal";
import { TransferModal, TransferModalRef } from "../TransferModal";
import { ViewFilesModalRef, ViewFilesModal } from "../ViewFilesModal";
import {
  WithdrawalModalRef,
  RejectSuperUserRequestModalRef,
  Spinner,
  WithdrawalModal,
  RejectSuperUserRequestModal,
  DataRow,
  DateFormatter,
} from "@common/components";
import { useDialog } from "@common/context";
import {
  useApproveSuperUserRequest,
  useSetSuperSaveWithdrawForm,
  useGetSuperSaveWithdrawForm,
  ISuperUserDetail,
  useGetUserTransferOwnershipHistory,
  useSaveCorporateBankChange,
  useGetUserConsents,
  useGetUserAirdropHistory,
  useUpdateSuperTrustStatus,
  UpdateSuperTrustStatus,
  useGetUserSuperTrustHistory,
  usePostUpdateUserDocumentByAdmin,
  useUploadFile,
  useGetUserCommitmentInfo,
  useGetUserReferralInfo,
  SupersaveRestriction,
  usePostUpdateUserSuperSaveStatus,
  useGetUserInheritors,
} from "api/hooks";
import { useLocale } from "locale";
import { htmlIds } from "@cypress/utils/ids";
import { Box, Button, CircularProgress, Switch } from "@mui/material";
import { useRouter } from "next/router";
import { UDUpdateUserModal } from "../UDUpdateUserModal";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SuperTrustHistoryModel, {
  SuperTrustHistoryModelRef,
} from "../SuperTrustHistory/SuperTrustHistoryModel";
import {
  AppConnectionModal,
  AppConnectionModalRef,
} from "../AppConnectionModal";
import { EducationHistoryDialog } from "@sections/super-save/education-management/components/EducationHistoryDialog";
import { EducationHistoryDialogRef } from "@sections/super-save/education-management/components/EducationHistoryDialog/types";
import { UpdateCommunityModal } from "@sections/users/components/UpdateCommunity";
import { EkycModal } from "../EkycModal";
import { userDataType, RejectSuperSaveModal, RejectSuperSaveModalRef } from "@common/components/RejectSuperSaveModal";
import { UserInheritorsModal } from "../UserInverstorsModal";
import { UserInheritorsModalRef } from "../UserInverstorsModal/UserInverstorsModal";
const copyToClipboard = (textToCopy: string) => {
  navigator.clipboard.writeText(textToCopy);
  toast("Copied to clipoard.", { type: "success", autoClose: 1500 });
};

interface BasicInformationTabProps {
  userDetail?: ISuperUserDetail;
  refetchUserDetails: () => void;
  isWithdrawalFormDetailLoading: boolean;
  handleTabChange: (value: number, subValue?: number) => void;
}

function BasicInformationTab({
  userDetail,
  refetchUserDetails,
  isWithdrawalFormDetailLoading,
  handleTabChange,
}: BasicInformationTabProps) {
  const { text } = useLocale();
  const router = useRouter();

  const withdrawalModal = useRef<WithdrawalModalRef>(null);
  const rejectSuperUserRequestModal =
    useRef<RejectSuperUserRequestModalRef>(null);
  const { mutateAsync: approveRequest } = useApproveSuperUserRequest();
  const { mutateAsync: saveCorporateBank, isLoading: requestChangeBankLoading } = useSaveCorporateBankChange();

  const { alertDialog, confirmDialog } = useDialog();
  const { mutateAsync: updateWithdrawalStatus, isLoading } =
    useSetSuperSaveWithdrawForm();

  const { mutateAsync: updateUserSuperSaveStatus } =
    usePostUpdateUserSuperSaveStatus();

  const [familyDocumentUploadLoading, setFamilyDocumentUploadLoading] =
    useState(false);
  const [commitmentDocumentUploadLoading, setCommitmentDocumentUploadLoading] =
    useState(false);

  const [
    CorporateBankStatementUploadLoading,
    setCorporateBankStatementUploadLoading,
  ] = useState(false);

  const [
    corporateBankRegistrationUploadLoading,
    setCorporateBankRegistrationUploadLoading,
  ] = useState(false);

  const { data } = useGetSuperSaveWithdrawForm({
    email: userDetail?.email || "",
  });
  const corporateMember = userDetail?.member_type === "corporate";

  const { data: consentHistory } = useGetUserConsents({
    user_id: userDetail?.id,
  });

  const { data: userCommitmentInfoListRes } = useGetUserCommitmentInfo({
    user_id: userDetail?.id,
  });

  const { data: userReferralInfoListRes } = useGetUserReferralInfo({
    user_id: userDetail?.id,
  });

  const userCommitmentInfoList = useMemo(() => userCommitmentInfoListRes?.referralResult || [], [userCommitmentInfoListRes]);

  const userReferralInfoList = useMemo(() => userReferralInfoListRes?.referralResult || [], [userReferralInfoListRes]);

  const { data: airdropHistory } = useGetUserAirdropHistory({
    phone_number: userDetail?.phone,
  });
  const { data: superTrustHistory } = useGetUserSuperTrustHistory({
    user_id: userDetail?.id,
  });
  const { data: userInheritor } = useGetUserInheritors({
    user_id: userDetail?.id,
    all: true
  });
  const { data: transferHistory } = useGetUserTransferOwnershipHistory({
    user_id: userDetail?.id,
  });

  const [usdtAction, setUsdtAction] = useState(false);
  const [superSaveAction, setSuperSaveAction] = useState(false);

  const withdrawFormDetail = data?.data;

  const { mutateAsync: updateSuperTrustStatus , status: updatingStatus} = useUpdateSuperTrustStatus();
  const { mutateAsync: updateUserDocumentByAdminApi } =
    usePostUpdateUserDocumentByAdmin();
  const { mutateAsync: uploadFileApi } = useUploadFile();
  const [rejectSuperSaveData, setRejectSuperSaveData] = useState<userDataType>();
  const rejectSuperSaveModal = useRef<RejectSuperSaveModalRef>(null);
  const checkConsentHistoryModal = useRef<CheckConsentHistoryModalRef>(null);
  const checkCommitmentInfoModal = useRef<CheckCommitmentInfoModalRef>(null);
  const checkReferralInfoModal = useRef<CheckReferralInfoModalRef>(null);
  const airdropHistoryModel = useRef<AirdropHistoryModelRef>(null);
  const superTrustHistoryModel = useRef<SuperTrustHistoryModelRef>(null);
  const userInheritorModal = useRef<UserInheritorsModalRef>(null);
  const checkOwnershipTransferHistoryModal =
    useRef<CheckOwnershipTransferHistoryModalRef>(null);
  const viewFilesModal = useRef<ViewFilesModalRef>(null);
  const viewRelationShipFilesModal = useRef<ViewFilesModalRef>(null);
  const viewCommitmentFilesModal = useRef<ViewFilesModalRef>(null);
  const viewBusinessRegistrationFilesModal = useRef<ViewFilesModalRef>(null);
  const viewBankStatementFilesModal = useRef<ViewFilesModalRef>(null);
  const transferModal = useRef<TransferModalRef>(null);
  const appConnectionModal = useRef<AppConnectionModalRef>(null);
  const educationHistoryDialogRef = useRef<EducationHistoryDialogRef>(null);
  const communityHistoryDialogRef = useRef<CommunityHistoryDialogRef>(null);
  const viewBankChangeModal = useRef<ViewBankChangeModalRef>(null);
  const familyDocImgInputRef = useRef<HTMLInputElement>(null);
  const commitmentImgInputRef = useRef<HTMLInputElement>(null);
  const corporateBankStatementInputRef = useRef<HTMLInputElement>(null);
  const corporateBankRegistrationInputRef = useRef<HTMLInputElement>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [existingValues, setExistingValues] = React.useState<
    [string | null, number | string | null]
  >([null, null]);
  const [modalType, setModalType] = React.useState<
    | "name"
    | "email"
    | "corporateName"
    | "corporateBankHolderName"
    | "corporateRegistrationNumber"
    | "phoneNumber"
    | "bankName"
    | "usdt_wallet"
  >("name");
  const [openBankChangeModal, setOpenBankChangeModal] = useState<
    "new" | "view" | null
  >(null);
  const [showUpdateTeamModal, setShowUpdateTeamModal] = useState(false);
  const [showeKycModal, setShoweKycModal] = useState(false);
  const [showUsdteKycModal, setShowUsdteKycModal] = useState(false);

  const handleModalOpen =
    (
      type:
        | "name"
        | "email"
        | "corporateName"
        | "corporateBankHolderName"
        | "corporateRegistrationNumber"
        | "phoneNumber"
        | "bankName"
        | "usdt_wallet",
    ) =>
      () => {
        setModalType(type);
        setOpenModal(true);

        if (type === "name") {
          setExistingValues([userDetail?.name || userDetail?.usdt_name || "", null]);
        } else if (type === "phoneNumber") {
          setExistingValues([
            null,
            userDetail?.phone_number ||
            userDetail?.usdt_phone_number ||
            userDetail?.phone ||
            "8201",
          ]);
        } else if (type === "bankName") {
          setExistingValues([
            userDetail?.bank_name || "",
            Number(userDetail?.bank_account_number),
          ]);
        } else if (type === "email") {
          setExistingValues([userDetail?.corporate_email || "", null]);
        } else if (type === "corporateName") {
          setExistingValues([userDetail?.corporate_name || "", null]);
        } else if (type === "corporateBankHolderName") {
          setExistingValues([userDetail?.bank_account_holder_name || "", null]);
        } else if (type === "usdt_wallet") {
          setExistingValues([
            userDetail?.wallet_id || "",
            Number(userDetail?.wallet_id),
          ]);
        } else if (type === "corporateRegistrationNumber") {
          setExistingValues([null, userDetail?.business_registration_number || ""])
        }
      };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleSaveBankChangeModalClose = useCallback(() => {
    setOpenBankChangeModal(null);
  }, []);

  const handleViewBankChange = () => {
    viewBankChangeModal.current?.open({
      user_id: userDetail?.user_id ?? "",
      bankName: userDetail?.bank_change_request?.bank_name ?? "",
      bankAccountNumber:
        userDetail?.bank_change_request?.bank_account_number ?? "",
      bankAccountHolderName:
        userDetail?.bank_change_request?.bank_account_holder_name ?? "",
      bankStatementFile:
        userDetail?.bank_change_request?.bank_statement_file ?? "",
    });
  };

  const handleSaveBankChange = useCallback(
    async (formData: BankChangeModalFormType) => {
      try {
        const form_data = new FormData();
        form_data.append("user_id", userDetail?.user_id ?? "");
        form_data.append("bank_name", formData?.bankName ?? "");
        form_data.append(
          "bank_account_number",
          formData?.bankAccountNumber ?? "",
        );
        form_data.append(
          "bank_account_holder_name",
          formData?.bankAccountHolderName ?? "",
        );
        form_data.append("file", formData?.bankStatementFile ?? "");
        await saveCorporateBank(form_data);
        toast(text("corporate_user_details_bank_updated"), {
          type: "success",
        });
        refetchUserDetails();
        handleSaveBankChangeModalClose();
      }
      // }
      catch (err: any) {
        toast(err?.response?.data?.error || err?.response?.data?.result, {
          type: "error",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      refetchUserDetails,
      handleSaveBankChangeModalClose,
      userDetail,
      saveCorporateBank,
    ],
  );

  const handleApproveRequest = (currentUSDTAction = false) => {
    if (
      (!currentUSDTAction && userDetail?.uuid) ||
      (currentUSDTAction && userDetail?.usdt_uuid)
    ) {
      confirmDialog({
        title: "Approved",
        content: "Would you like to approve?",
        onOk: () =>
          approveRequest({
            request_id: currentUSDTAction
              ? userDetail?.usdt_uuid || ""
              : userDetail?.uuid || "",
            usdtAction: currentUSDTAction,
          })
            .then(() => {
              alertDialog({
                title: "Saved.",
                onOk: async () => {
                  refetchUserDetails();
                },
              });
            })
            .catch((err) => {
              toast.error(err?.response?.data?.message);
            }),
      });
    }
  };

  const handleRejectRequest = (currentUsdtAction = false, currentSuperSaveAction = false) => {
    setUsdtAction(currentUsdtAction);
    setSuperSaveAction(currentSuperSaveAction);
    rejectSuperUserRequestModal.current?.open();
  };

  const onUpdate = (props: UpdateSuperTrustStatus) => {
    updateSuperTrustStatus(props, {
      onSuccess: () => {
        toast.success(text("super_save_user_super_trust_status_update"), {
          autoClose: 1500,
        });
        refetchUserDetails();
      },
    });
  };

  const handleOnFamilyDocChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, currentUserId?: string) => {
      const file = e.target.files?.[0];
      if (file) {
        confirmDialog({
          title: text(
            "user_details_family_relationship_document_upload_confirm",
          ),
          onOk: async () => {
            setFamilyDocumentUploadLoading(true);
            uploadFileApi({ file })
              .then((fileUrl) => {
                updateUserDocumentByAdminApi({
                  userId: currentUserId as string,
                  family_relationship_document: fileUrl,
                })
                  .then(() => {
                    toast.success(
                      text("user_details_family_relationship_document_updated"),
                    );
                    setFamilyDocumentUploadLoading(false);
                    refetchUserDetails();
                    if (familyDocImgInputRef.current) {
                      familyDocImgInputRef.current.value = "";
                    }
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.message ||
                      "Failed to update family relationship document",
                    );
                    setFamilyDocumentUploadLoading(false);
                    if (familyDocImgInputRef.current) {
                      familyDocImgInputRef.current.value = "";
                    }
                  });
              })
              .catch((err) => {
                toast.error(
                  err?.response?.data?.message || "Failed to upload file",
                );
                setFamilyDocumentUploadLoading(false);
                if (familyDocImgInputRef.current) {
                  familyDocImgInputRef.current.value = "";
                }
              });
          },
          onCancel: () => {
            if (familyDocImgInputRef.current) {
              familyDocImgInputRef.current.value = "";
            }
          },
        });
      }
    },
    [
      confirmDialog,
      refetchUserDetails,
      text,
      updateUserDocumentByAdminApi,
      uploadFileApi,
    ],
  );
  const handleOnCommitmentDocChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, currentUserId?: string) => {
      const file = e.target.files?.[0];
      if (file) {
        confirmDialog({
          title: text("user_details_commitment_document_upload_confirm"),
          onOk: async () => {
            setCommitmentDocumentUploadLoading(true);
            uploadFileApi({ file })
              .then((fileUrl) => {
                updateUserDocumentByAdminApi({
                  userId: currentUserId as string,
                  commitment_file: fileUrl,
                })
                  .then(() => {
                    toast.success(
                      text("user_details_commitment_document_updated"),
                    );
                    setCommitmentDocumentUploadLoading(false);
                    refetchUserDetails();
                    if (commitmentImgInputRef.current) {
                      commitmentImgInputRef.current.value = "";
                    }
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.message ||
                      "Failed to update commitment document",
                    );
                    setCommitmentDocumentUploadLoading(false);
                    if (commitmentImgInputRef.current) {
                      commitmentImgInputRef.current.value = "";
                    }
                  });
              })
              .catch((err) => {
                toast.error(
                  err?.response?.data?.message || "Failed to upload file",
                );
                setCommitmentDocumentUploadLoading(false);
                if (commitmentImgInputRef.current) {
                  commitmentImgInputRef.current.value = "";
                }
              });
          },
          onCancel: () => {
            if (commitmentImgInputRef.current) {
              commitmentImgInputRef.current.value = "";
            }
          },
        });
      }
    },
    [
      confirmDialog,
      refetchUserDetails,
      text,
      updateUserDocumentByAdminApi,
      uploadFileApi,
    ],
  );
  const handleOnCorporateBankStatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, currentUserId?: string) => {
      const file = e.target.files?.[0];
      if (file) {
        confirmDialog({
          title: text("user_details_bank_book_copy_upload_confirm"),
          onOk: async () => {
            setCorporateBankStatementUploadLoading(true);
            uploadFileApi({ file })
              .then((fileUrl) => {
                updateUserDocumentByAdminApi({
                  userId: currentUserId as string,
                  bank_statement_file: fileUrl,
                })
                  .then(() => {
                    toast.success(text("user_details_bank_book_copy_updated"));
                    setCorporateBankStatementUploadLoading(false);
                    refetchUserDetails();
                    if (corporateBankStatementInputRef.current) {
                      corporateBankStatementInputRef.current.value = "";
                    }
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.message ||
                      "Failed to update corporate bank book document",
                    );
                    setCorporateBankStatementUploadLoading(false);
                    if (corporateBankStatementInputRef.current) {
                      corporateBankStatementInputRef.current.value = "";
                    }
                  });
              })
              .catch((err) => {
                toast.error(
                  err?.response?.data?.message || "Failed to upload file",
                );
                setCorporateBankStatementUploadLoading(false);
                if (corporateBankStatementInputRef.current) {
                  corporateBankStatementInputRef.current.value = "";
                }
              });
          },
          onCancel: () => {
            if (corporateBankStatementInputRef.current) {
              corporateBankStatementInputRef.current.value = "";
            }
          },
        });
      }
    },
    [
      confirmDialog,
      refetchUserDetails,
      text,
      updateUserDocumentByAdminApi,
      uploadFileApi,
    ],
  );

  const handleOnCorporateRegistrationFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, currentUserId?: string) => {
      const file = e.target.files?.[0];
      if (file) {
        confirmDialog({
          title: text(
            "user_details_corporate_bank_registration_certificate_upload_confirm",
          ),
          onOk: async () => {
            setCorporateBankRegistrationUploadLoading(true);
            uploadFileApi({ file })
              .then((fileUrl) => {
                updateUserDocumentByAdminApi({
                  userId: currentUserId as string,
                  business_registration_file: fileUrl,
                })
                  .then(() => {
                    toast.success(
                      text(
                        "user_details_corporate_bank_registration_certificate_updated",
                      ),
                    );
                    setCorporateBankRegistrationUploadLoading(false);
                    refetchUserDetails();
                    if (corporateBankRegistrationInputRef.current) {
                      corporateBankRegistrationInputRef.current.value = "";
                    }
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.message ||
                      "Failed to update corporate registration certificate",
                    );
                    setCorporateBankRegistrationUploadLoading(false);
                    if (corporateBankRegistrationInputRef.current) {
                      corporateBankRegistrationInputRef.current.value = "";
                    }
                  });
              })
              .catch((err) => {
                toast.error(
                  err?.response?.data?.message || "Failed to upload file",
                );
                setCorporateBankRegistrationUploadLoading(false);
                if (corporateBankRegistrationInputRef.current) {
                  corporateBankRegistrationInputRef.current.value = "";
                }
              });
          },
          onCancel: () => {
            if (corporateBankRegistrationInputRef.current) {
              corporateBankRegistrationInputRef.current.value = "";
            }
          },
        });
      }
    },
    [
      confirmDialog,
      refetchUserDetails,
      text,
      updateUserDocumentByAdminApi,
      uploadFileApi,
    ],
  );

  const onUpdateSuperSaveStatus = async (props: SupersaveRestriction) => {
    const updateStatusData = {
     user_id: props.user_id,
     reason: ""
    };

     try {
       await updateUserSuperSaveStatus(updateStatusData, {
         onSuccess: () => {
           toast.success(text("user_super_save_status_update"), {
             autoClose: 1500,
           });
         },
       });
       refetchUserDetails();
     } catch (error: any) {
       if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
         toast.error(text("super_save_user_community_offline_error"), {
           autoClose: 1500,
         });
       } else {
         toast.error(
           error.response?.data?.result ||
           "There was an error, please try again",
         );
       }
     }
   };

  const onHandleRestriction = async (props: SupersaveRestriction) => {
    if(props.status){
      setRejectSuperSaveData(props);
      rejectSuperSaveModal.current?.open();
    } else {
      confirmDialog({
      title: "Super Save",
      content: text("user_super_save_confirmation"),
      onOk: async () => onUpdateSuperSaveStatus(props),
      });
    };
  };

  const isEnabled = !userDetail?.super_save_restriction || userDetail?.super_save_restriction.trim().length === 0;

  const handleUpdateWithdrawStatus = async () => {
    if (withdrawFormDetail) {
      await updateWithdrawalStatus({
        withdraw_request_id: withdrawFormDetail?.withdraw_request_id,
      })
        .then((res) => {
          refetchUserDetails();
          alertDialog({
            title: res?.data?.message || text("user_withdrawal_saved_error"),
            onOk: async () => {
              router.push("/users");
            },
          });
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message);
        });
    }
  };
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const onWithdrawal = () => {
    confirmDialog({
      title: withdrawFormDetail?.name || "",
      content: text("user_withdrawal_confirmation"),
      onOk: () => handleUpdateWithdrawStatus(),
    });
  };

  if (isWithdrawalFormDetailLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }


  const handleChangeTeam = () => {
    setShowUpdateTeamModal(true);
  };

  const handleVieweKyc = () => {
    setShoweKycModal(true);
  };

  const handleViewUsdteKyc = () => {
    setShowUsdteKycModal(true);
  };

  return (
    <div>
      <div className="my-3 flex justify-between items-center">
        <div className="font-medium text-lg">Profile</div>
        <div className="flex sm:flex-row flex-col">
          <button
            onClick={() => appConnectionModal.current?.open()}
            className="mb-1 ml-1 items-center group rounded-md border
              border-transparent bg-blue-600 py-2 w-40 text-sm font-medium text-white hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {text("user_details_basic_tab_app_connection")}
          </button>
          {isSuperSaveUser(userDetail) && (
            <button
              onClick={() => transferModal.current?.open()}
              className="mb-1 ml-1 items-center group rounded-md border
            border-transparent bg-orange-600 py-2 w-40 text-sm font-medium text-white hover:bg-orange-700
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {text("user_details_basic_tab_transfer")}
            </button>
          )}

          {userDetail?.member_status !== 2 && (
            <button
              id={htmlIds.btn_user_details_basic_info_open_withdraw_modal}
              onClick={() => {
                // if (userDetail?.member_status === 1) onWithdrawal();
                // else
                withdrawalModal.current?.open();
              }}
              className="mb-1 ml-1 items-center group rounded-md border border-transparent bg-red-600 py-2 w-40 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {!isLoading
                ? userDetail?.member_status === 1
                  ? text("basic_information_waiting_for_withdrawal")
                  : text("basic_information_title")
                : null}
              {isLoading && <Spinner />}
            </button>
          )}
        </div>
      </div>
      <div className="w-full overflow-auto">
        <div className="border border-1 min-w-[800px]">
          <DataRow
            label={text("basic_information_user_name")}
            value={
              <p id={htmlIds.p_user_details_basic_info_username}>
                {userDetail?.msq_name || "---"}
              </p>
            }
          />
          <DataRow
            label={text("basic_information_user_id")}
            value={
              <>
                <p id={htmlIds.p_user_details_basic_info_user_id}>
                  {userDetail?.id}
                </p>
                <Button
                  aria-label="copy icon"
                  variant="text"
                  disabled={!userDetail?.id?.length}
                  onClick={() => copyToClipboard(userDetail?.id || "")}
                >
                  <Image
                    className="cursor-pointer"
                    alt=""
                    width={17}
                    height={17}
                    src="/images/copy-icon.svg"
                  />
                </Button>
              </>
            }
          />
          <DataRow
            label={text("basic_information_email")}
            value={
              <p id={htmlIds.p_user_details_basic_info_user_email}>
                {userDetail?.email}
              </p>
            }
          />
          <DataRow
            label={text("users_column_header_super_save_community")}
            value={
              <p id={htmlIds.p_user_details_basic_info_user_email}>
                {userDetail?.community ? (
                  <span className="w-fit truncate capitalize">{userDetail?.community}</span>
                ) : (
                  <span className="">---
                  </span>
                )
                }
                {
                  userDetail?.community_type !== 1 && <button
                    onClick={handleChangeTeam}
                    disabled={userDetail?.status !== 1}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
                  >
                    {text("change_button_text")}
                  </button>
                }
              </p>
            }
          />
          <DataRow
            label={text("users_column_header_super_save_community_type")}
            value={
              <p id={htmlIds.p_user_details_basic_info_user_email}>
                {
                  userDetail?.community ?
                    <>
                      {
                        userDetail?.community_type === 1 ? (
                          <span className="w-fit truncate">{text("users_column_header_super_save_community_type_representative")}</span>
                        ) : (
                          <span className="w-fit truncate">{text("users_column_header_super_save_community_type_regular_member")}</span>
                        )
                      }
                    </>
                    :
                    <span className="w-fit truncate">---</span>
                }

              </p>
            }
          />
          {userDetail?.status === 1 &&
          <DataRow
            label={text("basic_information_super_save_status")}
            value={
              <div className="flex space-x-1 items-center">
                <p>{isEnabled ? text("deposit_information_super_save_enabled") : text("deposit_information_super_save_disabled")}</p>
                <Switch
                  onClick={() =>
                    onHandleRestriction({
                      user_id: userDetail?.user_id || "",
                      user_email: userDetail?.email || "",
                      user_name: userDetail?.user_name || "",
                      status: isEnabled,
                    })
                  }
                  checked={isEnabled}
                  inputProps={{ style: { display: "none" } }}
                />
              </div>
            }
          />
          }
          {userDetail?.status === 1 && (
            <DataRow
              label={text("basic_information_super_trust_status")}
              value={
                <div className="flex space-x-1 items-center">
                  <p>
                    {userDetail?.super_trust_status === 1
                      ? text("deposit_information_super_trust_enabled")
                      : text("deposit_information_super_trust_disabled")}
                  </p>
                  <Switch
                    onClick={() =>
                      onUpdate({
                        user_id: userDetail?.id,
                        status: userDetail?.super_trust_status === 1 ? 0 : 1,
                      })
                    }
                    checked={userDetail?.super_trust_status === 1}
                    inputProps={{ style: { display: "none" } }}
                    disabled = {updatingStatus === "loading"}
                  />
                  <button
                    onClick={() => superTrustHistoryModel.current?.open()}
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_super_trust_history")}
                    {` (${superTrustHistory?.userTrustHistory?.length || 0})`}
                  </button>
                  <SuperTrustHistoryModel
                    user_id={userDetail?.id as string}
                    ref={superTrustHistoryModel}
                  />
                </div>
              }
            />
          )}
          {userDetail?.status === 1 && (
            <DataRow
              label={text("basic_information_user_inheritors")}
              value={
                <div className="flex space-x-1 items-center">
                  <button
                    onClick={() => userInheritorModal.current?.open()}
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_user_inheritors")}
                    {` (${userInheritor?.inheritors?.length || 0})`}
                  </button>
                  <UserInheritorsModal
                    user_id={userDetail?.id as string}
                    ref={userInheritorModal}
                  />
                </div>
              }
            />
          )}
          <DataRow
            label={text("basic_information_membership_status")}
            value={(() => {
              switch (userDetail?.member_status) {
                case 0:
                  return (
                    <p id={htmlIds.p_user_details_basic_info_membership_status}>
                      {text("basic_information_status_normal")}
                    </p>
                  );
                case 1:
                  return (
                    <p
                      id={htmlIds.p_user_details_basic_info_membership_status}
                      className="text-red-500"
                    >{`${text(
                      "basic_information_status_waiting_for_withdrawal",
                    )} ${userDetail.withdrawal_action_date
                      ? userDetail.withdrawal_action_date.slice(0, 10) +
                      " " +
                      userDetail.withdrawal_action_date.slice(11, 19)
                      : ""
                      })`}</p>
                  );
                case 2:
                  return (
                    <div className="flex items-center gap-2">
                      <p
                        id={htmlIds.p_user_details_basic_info_membership_status}
                      >{`${text(
                        "basic_information_status_withdrawal_complete",
                      )} ${userDetail.withdrawal_action_date
                        ? userDetail.withdrawal_action_date.slice(0, 10) +
                        " " +
                        userDetail.withdrawal_action_date.slice(11, 19)
                        : ""
                        })`}</p>
                      <button
                        id={
                          htmlIds.btn_user_details_basic_info_withdraw_reason_confirm
                        }
                        onClick={() => withdrawalModal.current?.open()}
                        className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {text("basic_information_status_confirm_reason")}
                      </button>
                    </div>
                  );
                default:
                  return null;
              }
            })()}
          />
          <DataRow
            label={text("user_column_header_corporate_status")}
            value={
              <p
                className={
                  userDetail?.member_type === "corporate" ? "text-[#3b82f6]" : ""
                }
              >
                {userDetail?.member_type === "corporate"
                  ? text("users_member_type_corporation")
                  : userDetail?.member_type === "individual"
                    ? text("users_member_type_individual")
                    : "---"}
              </p>
            }
          />
          <DataRow
            label={text("basic_information_register_super_save")}
            value={
              <div className="flex items-center gap-1">
                {(() => {
                  switch (userDetail?.status) {
                    case 0:
                      return (
                        <p
                          id={htmlIds.p_user_details_basic_info_register_status}
                          className="text-green-500"
                        >{`${text(
                          "register_super_save_status_waiting_for_approval",
                        )} ${userDetail.createdAt
                          ? userDetail.createdAt.slice(0, 10) +
                          " " +
                          userDetail.createdAt.slice(11, 19)
                          : ""
                          })`}</p>
                      );
                    case 1:
                      return (
                        <p
                          id={htmlIds.p_user_details_basic_info_register_status}
                          className="text-blue-500"
                        >{`${text("register_super_save_status_approved")} ${userDetail.action_date
                          ? userDetail.action_date.slice(0, 10) +
                          " " +
                          userDetail.action_date.slice(11, 19)
                          : ""
                          })`}</p>
                      );
                    case 2:
                      return (
                        <div className="flex items-center gap-2">
                          <p
                            id={htmlIds.p_user_details_basic_info_register_status}
                            className="text-orange-500"
                          >{`${text("register_super_save_status_denial")} ${userDetail.action_date
                            ? userDetail.action_date.slice(0, 10) +
                            " " +
                            userDetail.action_date.slice(11, 19)
                            : ""
                            })`}</p>

                          <button
                            id={
                              htmlIds.btn_user_details_basic_info_withdraw_reason_reject
                            }
                            onClick={() => handleRejectRequest(false)}
                            className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {text("register_super_save_status_check_reason")}
                          </button>
                        </div>
                      );
                    case 3:
                      return (
                        <p
                          id={htmlIds.p_user_details_basic_info_register_status}
                          className="underline text-orange-500"
                        >
                          {text("register_super_save_status_completed")}
                        </p>
                      );
                    default:
                      return (
                        <p id={htmlIds.p_user_details_basic_info_register_status}>
                          {text("register_super_save_status_not_applicable")}
                        </p>
                      );
                  }
                })()}
                {userDetail?.status === 0 && (
                  <>
                    <button
                      id={htmlIds.btn_user_details_basic_info_withdraw_reject}
                      onClick={() => handleRejectRequest(false, true)}
                      className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("register_super_save_status_denial_of_approval")}
                    </button>
                    <button
                      id={htmlIds.btn_user_details_basic_info_withdraw_approve}
                      onClick={() => handleApproveRequest(false)}
                      className="group rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("register_super_save_status_approve")}
                    </button>
                  </>
                )}
              </div>
            }
          />
          <DataRow
            label={text("basic_information_register_super_save_usdt")}
            value={
              <div className="flex items-center gap-1">
                {(() => {
                  switch (userDetail?.usdt_status) {
                    case 0:
                      return (
                        <p className="text-green-500">{`${text(
                          "register_super_save_status_waiting_for_approval",
                        )} ${userDetail.usdt_verification_date
                          ? userDetail.usdt_verification_date.slice(0, 10) +
                          " " +
                          userDetail.usdt_verification_date.slice(11, 19)
                          : ""
                          })`}</p>
                      );
                    case 1:
                      return (
                        <p className="text-blue-500">{`${text(
                          "register_super_save_status_approved",
                        )} ${userDetail.usdt_action_date
                          ? userDetail.usdt_action_date.slice(0, 10) +
                          " " +
                          userDetail.usdt_action_date.slice(11, 19)
                          : ""
                          })`}</p>
                      );
                    case 2:
                      return (
                        <div className="flex items-center gap-2">
                          <p className="text-orange-500">{`${text(
                            "register_super_save_status_denial",
                          )} ${userDetail.usdt_action_date
                            ? userDetail.usdt_action_date.slice(0, 10) +
                            " " +
                            userDetail.usdt_action_date.slice(11, 19)
                            : ""
                            })`}</p>
                          <button
                            onClick={() => handleRejectRequest(true)}
                            className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {text("register_super_save_status_check_reason")}
                          </button>
                        </div>
                      );
                    default:
                      return (
                        <p>{text("register_super_save_status_not_applicable")}</p>
                      );
                  }
                })()}
                {userDetail?.usdt_status === 0 && (
                  <>
                    <button
                      id={htmlIds.btn_user_details_basic_info_withdraw_reject}
                      onClick={() => handleRejectRequest(true)}
                      className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("register_super_save_status_denial_of_approval")}
                    </button>
                    <button
                      id={htmlIds.btn_user_details_basic_info_withdraw_approve}
                      onClick={() => handleApproveRequest(true)}
                      className="group rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("register_super_save_status_approve")}
                    </button>
                  </>
                )}
              </div>
            }
          />
          {!corporateMember && (userDetail?.name || userDetail?.usdt_name) && (
            <DataRow
              label={text("basic_information_name")}
              value={
                <p id={htmlIds.p_user_details_basic_info_name}>
                  {userDetail?.name || userDetail?.usdt_name}
                  {isSuperSaveUser(userDetail) && (
                    <button
                      id={htmlIds.btn_user_details_basic_info_view_files}
                      onClick={handleModalOpen("name")}
                      className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("change_button_text")}
                    </button>
                  )}
                </p>
              }
            />
          )}
          {!corporateMember && (userDetail?.birth_date || userDetail?.usdt_birth_date) && (
            <DataRow
              label={text("basic_information_birth_date")}
              value={
                <p id={htmlIds.p_user_details_basic_info_birth_date}>
                   {userDetail?.birth_date ? convertToYYYYMMDD(userDetail?.birth_date) : userDetail?.usdt_birth_date}
                </p>
              }
            />
          )}
          {!corporateMember && userDetail?.registration_number && userDetail?.birth_date && (
            <DataRow
              label={text("basic_information_resident_number")}
              value={
                <p id={htmlIds.p_user_details_basic_info_resident_number}>
                  {`${userDetail?.birth_date?.slice(-6)}-${userDetail?.registration_number}`}
                </p>
              }
            />
          )}
          <DataRow
            label={text("basic_information_referral_code")}
            value={
              <p id={htmlIds.p_user_details_basic_info_referral_code}>
                {userDetail?.referral_code || text("basic_information_no_referral_code")}
              </p>
            }
          />
          {/* )} */}
          <DataRow
            label={text("basic_information_phone_number")}
            value={
              <p id={htmlIds.p_user_details_basic_info_phone_number}>
                {userDetail?.status === 1 ? userDetail?.phone_number :
                  userDetail?.usdt_status === 1 ? userDetail?.usdt_phone_number :
                  userDetail?.phone ||
                  "---"}
                {!corporateMember && (
                  <button
                    id={htmlIds.btn_user_details_basic_info_view_files}
                    onClick={handleModalOpen("phoneNumber")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                )}
              </p>
            }
          />
          {!corporateMember && (userDetail?.nationality || userDetail?.usdt_nationality) && (
            <DataRow
              label={text("basic_information_nationality")}
              value={
                <p id={htmlIds.p_user_details_basic_info_nationality}>
                  {userDetail?.nationality || userDetail?.usdt_nationality}
                </p>
              }
            />
          )}
          {/*need to confirm */}
          {!corporateMember && userDetail?.name && (
            <DataRow
              label={text("basic_information_id")}
              value={
                ![1, 2].includes(Number(userDetail?.status)) ? (
                  <>
                    <button
                      id={htmlIds.btn_user_details_basic_info_view_files}
                      onClick={() => viewFilesModal.current?.open()}
                      className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 w-36 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("basic_information_view_files")}
                    </button>
                    <ViewFilesModal
                      ref={viewFilesModal}
                      files={[
                        { file_name: "id_image", file_url: userDetail.id_image },
                        {
                          file_name: "profile_image",
                          file_url: userDetail.profile_image,
                        },
                      ]}
                    />
                  </>
                ) : (
                  `${text("basic_information_destruction_complete")} ${userDetail.action_date
                    ? userDetail.action_date.slice(0, 10) +
                    " " +
                    userDetail.action_date.slice(11, 19)
                    : ""
                  })`
                )
              }
            />
          )}
          {userDetail?.ekyc_data && userDetail?.ekyc_data !== "[]" && (
            <DataRow
              label={text("basic_information_ekyc")}
              value={
                <p id={htmlIds.p_user_details_basic_info_ekyc}>
                  <button
                    onClick={handleVieweKyc}
                    className="group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
                  >
                    {text("ekyc_view_result")}
                  </button>
                  <span className="ml-2">
                    {text("ekyc_face_recognizing_text")}&nbsp;
                    {userDetail?.face_recognition?.toFixed(2)}
                  </span>
                  {
                    userDetail?.status === 0 &&
                    <span className="text-red-500 ml-2">
                      {userDetail?.remark}
                    </span>
                  }
                  {
                    userDetail?.status === 1 && userDetail?.remark &&
                    <span className="text-yellow-500 ml-2">
                      {userDetail?.remark}
                    </span>
                  }
                  {
                    userDetail?.status === 1 && !userDetail?.remark &&
                    <span className="text-blue-500 ml-2">
                      {text("super_save_registration_approved")}
                    </span>
                  }
                </p>
              }
            />
          )}
          {userDetail?.usdt_ekyc_data && userDetail?.usdt_ekyc_data !== "[]" && (
            <DataRow
              label={"USDT " + text("basic_information_ekyc")}
              value={
                <p id={htmlIds.p_user_details_basic_info_usdt_ekyc}>
                  <button
                    onClick={handleViewUsdteKyc}
                    className="group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2  disabled:bg-blue-300 disabled:text-neutral-100 disabled:cursor-not-allowed"
                  >
                    {text("ekyc_view_result")}
                  </button>
                </p>
              }
            />
          )}
          {[0, 1, 2, 3].includes(Number(userDetail?.status)) && (
            <>
              <DataRow
                label={text("basic_information_family_relationship_document")}
                value={
                  <>
                    {userDetail?.family_relationship_file ? (
                      <>
                        <Button
                          onClick={() =>
                            viewRelationShipFilesModal.current?.open()
                          }
                          variant="outlined"
                          startIcon={<VisibilityOutlinedIcon />}
                        >
                          {text("basic_information_view_files")}
                        </Button>

                        <ViewFilesModal
                          ref={viewRelationShipFilesModal}
                          files={[
                            {
                              file_name: "family_relationship_file",
                              file_url: userDetail.family_relationship_file,
                            },
                          ]}
                        />
                      </>
                    ) : (
                      <div className="text-green-500">
                        {text(
                          "basic_information_family_relationship_document_not_required_text",
                        )}
                      </div>
                    )}
                    <button
                      id={
                        htmlIds.btn_user_details_basic_info_change_family_document_files
                      }
                      onClick={() => familyDocImgInputRef.current?.click()}
                      disabled={familyDocumentUploadLoading}
                      className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {familyDocumentUploadLoading && <Spinner size={4} />}
                      {text("change_button_text")}
                    </button>
                    <input
                      ref={familyDocImgInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleOnFamilyDocChange(e, userDetail?.user_id)
                      }
                    />
                  </>
                }
              />
            </>
          )}

          {[0, 1, 2, 3].includes(Number(userDetail?.status)) && (
            <>
              <DataRow
                label={text("basic_information_commitment_document")}
                value={
                  <>
                    {userDetail?.commitment_file ? (
                      <>
                        <Button
                          onClick={() => viewCommitmentFilesModal.current?.open()}
                          variant="outlined"
                          startIcon={<VisibilityOutlinedIcon />}
                        >
                          {text("basic_information_view_files")}
                        </Button>

                        <ViewFilesModal
                          ref={viewCommitmentFilesModal}
                          files={[
                            {
                              file_name: "commitment_file",
                              file_url: userDetail.commitment_file,
                            },
                          ]}
                        />
                      </>
                    ) : (
                      <div className="text-green-500">
                        {text(
                          "basic_information_family_relationship_document_not_required_text",
                        )}
                      </div>
                    )}
                    <button
                      id={
                        htmlIds.btn_user_details_basic_info_change_commitment_files
                      }
                      onClick={() => commitmentImgInputRef.current?.click()}
                      disabled={commitmentDocumentUploadLoading}
                      className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {commitmentDocumentUploadLoading && <Spinner size={4} />}
                      {text("change_button_text")}
                    </button>
                    <input
                      ref={commitmentImgInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleOnCommitmentDocChange(e, userDetail?.user_id)
                      }
                    />
                  </>
                }
              />
            </>
          )}
          {userDetail?.id && (
            <DataRow
              label={text("basic_information_commitment_information")}
              labelConClassName={"h-[70px]"}
              value={
                <>
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_open_check_commitment_info_modal
                    }
                    onClick={() => checkCommitmentInfoModal.current?.open()}
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_commitment_information")}{" "}
                    {`(${userCommitmentInfoList?.length || 0})`}
                  </button>
                  <CheckCommitmentInfoModal
                    user_id={userDetail.id}
                    ref={checkCommitmentInfoModal}
                  />
                </>
              }
            />
          )}
          {userDetail?.id && (
            <DataRow
              label={text("basic_information_referral_information")}
              labelConClassName={"h-[70px]"}
              value={
                <>
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_open_check_referral_info_modal
                    }
                    onClick={() => checkReferralInfoModal.current?.open()}
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_referral_information")}{" "}
                    {`(${userReferralInfoList?.length || 0})`}
                  </button>
                  <CheckReferralInfoModal
                    user_id={userDetail.id}
                    ref={checkReferralInfoModal}
                  />
                </>
              }
            />
          )}
          {!corporateMember &&
            userDetail?.bank_account_number &&
            userDetail?.bank_account_number?.length > 0 && (
              <DataRow
                label={text("basic_information_bank_and_account_number")}
                value={
                  <div className={"flex space-x-1 items-center"}>
                    <p id={htmlIds.p_user_details_basic_info_bank_name}>
                      {userDetail?.bank_name}
                    </p>
                    <span>/</span>
                    <p id={htmlIds.p_user_details_basic_info_account_number}>
                      {userDetail?.bank_account_number
                        ? userDetail?.bank_account_number
                        : "---"}
                      {isSuperSaveUser(userDetail) && (
                        <button
                          id={htmlIds.btn_user_details_basic_info_view_files}
                          onClick={() => handleTabChange(6)}
                          className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          {text("basic_information_manage_button")}
                        </button>
                      )}
                    </p>
                  </div>
                }
              />
            )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_name")}
              value={
                <div className={"flex items-center space-x-3"}>
                  <p>{userDetail?.corporate_name || "---"}</p>
                  <button
                    id={htmlIds.btn_user_details_basic_info_view_files}
                    onClick={handleModalOpen("corporateName")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                </div>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_reg_no")}
              value={
                <p>
                  {userDetail?.business_registration_number || "---"}
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_change_bank_accont_holder_name
                    }
                    onClick={handleModalOpen("corporateRegistrationNumber")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                </p>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_business_registration")}
              value={
                <p>
                  {userDetail?.business_registration_file ? (
                    <>
                      <Button
                        onClick={() =>
                          viewBusinessRegistrationFilesModal.current?.open()
                        }
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                      >
                        {text("basic_information_view_files")}
                      </Button>
                      <ViewFilesModal
                        ref={viewBusinessRegistrationFilesModal}
                        files={[
                          {
                            file_name: "business_registration_file",
                            file_url: userDetail?.business_registration_file,
                          },
                        ]}
                      />
                    </>
                  ) : (
                    "---"
                  )}
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_change_family_document_files
                    }
                    onClick={() =>
                      corporateBankRegistrationInputRef.current?.click()
                    }
                    disabled={corporateBankRegistrationUploadLoading}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {corporateBankRegistrationUploadLoading && (
                      <Spinner size={4} />
                    )}
                    {text("change_button_text")}
                  </button>
                  <input
                    ref={corporateBankRegistrationInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleOnCorporateRegistrationFileChange(
                        e,
                        userDetail?.user_id,
                      )
                    }
                  />
                </p>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_bank_or_account_no")}
              value={
                <p>
                  {userDetail?.bank_name || "---"} {" / "}
                  {userDetail?.bank_account_number || "---"}
                  {/* {isSuperSaveUser(userDetail) && ( */}
                  {userDetail?.bank_change_request &&
                    Object.values(userDetail.bank_change_request).length > 0 ? (
                    <Button
                      variant="outlined"
                      startIcon={<AutorenewIcon />}
                      onClick={handleViewBankChange}
                      className="ml-3 group rounded-md border py-2 text-sm font-medium "
                    >
                      {text("corporate_user_details_view_bank_change_request")}
                    </Button>
                  ) : (
                    <button
                      id={htmlIds.btn_user_details_basic_info_view_files}
                      onClick={() => setOpenBankChangeModal("new")}
                      className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {text("corporate_user_details_change_bank_account")}
                    </button>
                  )}
                </p>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_bank_account_holder")}
              value={
                <div className="flex items-center">
                  <p>{userDetail?.bank_account_holder_name || "---"}</p>
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_change_bank_accont_holder_name
                    }
                    onClick={handleModalOpen("corporateBankHolderName")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                </div>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_bankbook")}
              value={
                <p>
                  {userDetail?.bank_statement_file ? (
                    <>
                      <Button
                        onClick={() =>
                          viewBankStatementFilesModal.current?.open()
                        }
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                      >
                        {text("basic_information_view_files")}
                      </Button>

                      <ViewFilesModal
                        ref={viewBankStatementFilesModal}
                        files={[
                          {
                            file_name: "bank_statement_file",
                            file_url: userDetail?.bank_statement_file,
                          },
                        ]}
                      />
                    </>
                  ) : (
                    "---"
                  )}
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_change_family_document_files
                    }
                    onClick={() =>
                      corporateBankStatementInputRef.current?.click()
                    }
                    disabled={CorporateBankStatementUploadLoading}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {CorporateBankStatementUploadLoading && <Spinner size={4} />}
                    {text("change_button_text")}
                  </button>
                  <input
                    ref={corporateBankStatementInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleOnCorporateBankStatChange(e, userDetail?.user_id)
                    }
                  />
                </p>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_representative")}
              value={
                <div className={"flex items-center space-x-3"}>
                  <p>{userDetail?.name || "---"}</p>
                  <button
                    id={htmlIds.btn_user_details_basic_info_view_files}
                    onClick={handleModalOpen("name")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                </div>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_contract_info")}
              value={
                <div className={"flex items-center space-x-3"}>
                  <p>{userDetail?.phone_number || "---"}</p>
                  <button
                    id={htmlIds.btn_user_details_basic_info_view_files}
                    onClick={handleModalOpen("phoneNumber")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                </div>
              }
            />
          )}
          {corporateMember && (
            <DataRow
              label={text("user_column_header_corporate_contract_email")}
              value={
                <div className={"flex items-center space-x-3"}>
                  <p>{userDetail?.corporate_email || "---"}</p>
                  <button
                    id={htmlIds.btn_user_details_basic_info_view_files}
                    onClick={handleModalOpen("email")}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("change_button_text")}
                  </button>
                </div>
              }
            />
          )}
          <DataRow
            label={text("basic_information_usdt_wallet")}
            value={
              <p id={htmlIds.p_user_details_basic_info_usdt_wallet}>
                {userDetail?.wallet_id ? userDetail?.wallet_id : "---"}

                {isSuperSaveUser(userDetail) && (
                  <button
                    id={htmlIds.btn_user_details_basic_info_view_files}
                    onClick={() => handleTabChange(6, 1)}
                    className="ml-3 group rounded-md border border-transparent bg-blue-600 p-2 w-100 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_manage_button")}
                  </button>
                )}
              </p>
            }
          />
          {userDetail?.id && (
            <DataRow
              label={text("basic_information_service")}
              labelConClassName={"h-[70px]"}
              value={
                <>
                  <button
                    id={
                      htmlIds.btn_user_details_basic_info_open_check_consent_history_modal
                    }
                    onClick={() => checkConsentHistoryModal.current?.open()}
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_consent_history")}{" "}
                    {`(${consentHistory?.length || 0})`}
                  </button>
                  <CheckConsentHistoryModal
                    user_id={userDetail.id}
                    ref={checkConsentHistoryModal}
                  />
                </>
              }
            />
          )}

          <DataRow
            label={text("basic_information_airdrop_status")}
            value={
              <>
                {userDetail?.airdrop_status === 1 ? (
                  <span className="text-blue-500">
                    {text("view_airdrop_history_status_yes")}
                  </span>
                ) : (
                  <span className="text-red-500">
                    {text("view_airdrop_history_status_no")}
                  </span>
                )}
              </>
            }
          />

          <DataRow
            label={text("basic_information_airdrop_history")}
            labelConClassName={"h-[70px]"}
            value={
              <>
                <button
                  onClick={() => airdropHistoryModel.current?.open()}
                  className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {text("basic_information_airdrop_history_button")}{" "}
                  {`(${airdropHistory?.fetchAirdropHistory?.length || 0})`}
                </button>
                <AirdropHistoryModel
                  phone_number={userDetail?.phone as string}
                  ref={airdropHistoryModel}
                />
              </>
            }
          />
          <DataRow
            label={text("basic_information_offchain")}
            value={
              <div className="flex items-center gap-1 text-base">
                <p className="break-all">{userDetail?.offChainAddress}</p>
                {userDetail?.offChainAddress && (
                  <Button
                    id={htmlIds.btn_user_details_basic_info_copy_offchain_address}
                    variant="text"
                    onClick={() => copyToClipboard(userDetail?.offChainAddress)}
                  >
                    <Image
                      className="cursor-pointer"
                      width={19}
                      height={19}
                      src="/images/copy-icon.svg"
                      alt="Copy Icon"
                    />
                  </Button>
                )}
              </div>
            }
          />
          <DataRow
            label={text("basic_information_onchain")}
            value={
              <div className="flex items-center gap-1 text-base">
                <p className="break-all">{userDetail?.onChainAddress}</p>
                {userDetail?.onChainAddress && (
                  <Button
                    id={htmlIds.btn_user_details_basic_info_copy_onchain_address}
                    variant="text"
                    onClick={() => copyToClipboard(userDetail?.onChainAddress)}
                  >
                    <Image
                      width={19}
                      height={19}
                      src="/images/copy-icon.svg"
                      alt="Copy Icon"
                    />
                  </Button>
                )}
              </div>
            }
          />
          <DataRow
            label={text("basic_information_created_at")}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_created_at}
                  className="truncate"
                >
                  {userDetail?.signUpDate ? (
                    <DateFormatter value={userDetail?.signUpDate as string} breakLine />
                  ) : ("---")}
                </p>

              </div>
            }
          />
          <DataRow
            label={text("basic_information_created_by")}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_created_by}
                  className="truncate"
                >
                  User
                </p>

              </div>
            }
          />
          <DataRow
            label={text("basic_information_updated_at")}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_updated_at}
                  className="truncate"
                >
                  {
                    userDetail?.userUpdatedDate ? (
                      <DateFormatter value={userDetail?.userUpdatedDate as string} breakLine />
                    ) : ("---")
                  }
                </p>
              </div>
            }
          />
          <DataRow
            label={text("basic_information_updated_by")}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_updated_by}
                  className="truncate"
                >
                  {userDetail?.userUpdatedBy || "---"}
                </p>

              </div>
            }
          />
          <DataRow
            labelConClassName={"h-[80px]"}
            label={text("basic_information_total_super_save_application_amount")}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_signup_date_2}
                  className="truncate"
                >
                  {formatNumberWithCommas(
                    userDetail?.total_deposit_amount_in_won,
                  )}
                  {text("korean_currency_name") !== "KRW"
                    ? text("korean_currency_name")
                    : ` ${text("korean_currency_name")}`}
                </p>
              </div>
            }
          />
          <DataRow
            labelConClassName={"h-[80px]"}
            label={text("basic_information_remaining_super_save_amount")}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_remaining_amount_in_won}
                  className="truncate"
                >
                  {formatNumberWithCommas(
                    userDetail?.total_remaining_balance_in_won,
                  )}
                  {text("korean_currency_name") !== "KRW"
                    ? text("korean_currency_name")
                    : ` ${text("korean_currency_name")}`}
                </p>
              </div>
            }
          />
          <DataRow
            labelConClassName={"h-[80px]"}
            label={text(
              "basic_information_total_super_save_usdt_application_amount",
            )}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_signup_date_2}
                  className="truncate"
                >
                  {formatNumberWithCommas(
                    userDetail?.total_deposit_amount_in_usdt,
                  )}{" "}
                  USDT
                </p>
              </div>
            }
          />
          <DataRow
            labelConClassName={"h-[80px]"}
            label={text(
              "basic_information_remaining_super_save_usdt_amount",
            )}
            value={
              <div className="flex flex-col w-full">
                <p
                  id={htmlIds.p_user_details_basic_info_remaining_amount_in_usdt}
                  className="truncate"
                >
                  {formatNumberWithCommas(
                    userDetail?.total_remaining_balance_in_usdt,
                  )}{" "}
                  USDT
                </p>
              </div>
            }
          />
          {userDetail?.name && (
            <DataRow
              label={text("basic_information_transfer_history")}
              labelConClassName={"h-[70px]"}
              value={
                <>
                  <button
                    onClick={() =>
                      checkOwnershipTransferHistoryModal.current?.open()
                    }
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_transfer_history")}{" "}
                    {`(${transferHistory?.transferResult?.length || 0})`}
                  </button>
                  <CheckOwnershipTransferHistoryModal
                    user_id={userDetail.id}
                    ref={checkOwnershipTransferHistoryModal}
                  />
                </>
              }
            />
          )}
          {userDetail && (
            <DataRow
              label={text("basic_information_credit_sale_education_history")}
              labelConClassName={"h-[70px]"}
              value={
                <>
                  <button
                    onClick={() => educationHistoryDialogRef.current?.open()}
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_education_history")}{" "}
                  </button>
                  <EducationHistoryDialog
                    ref={educationHistoryDialogRef}
                    user={{
                      user_email: userDetail.email,
                      user_id: userDetail.id,
                    }}
                  />
                </>
              }
            />
          )}
          {userDetail && (
            <DataRow
              label={text("basic_information_community_history")}
              labelConClassName={"h-[70px]"}
              value={
                <>
                  <button
                    onClick={() =>
                      communityHistoryDialogRef.current?.open()
                    }
                    className="ml-1 group rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {text("basic_information_check_community_history")}{" "}
                  </button>
                  <CheckCommunityHistoryDialog
                    ref={communityHistoryDialogRef}
                    user={{
                      user_email: userDetail.email,
                      user_id: userDetail.id,
                    }}
                  />
                </>
              }
            />
          )}


        </div>
      </div>
      <ViewBankChangeModal
        onSubmit={refetchUserDetails}
        ref={viewBankChangeModal}
      />
      <BankChangeModal
        open={openBankChangeModal === "new"}
        formType={"Add"}
        submit={handleSaveBankChange}
        handleClose={handleSaveBankChangeModalClose}
        isLoading={requestChangeBankLoading}
      />
      <RejectSuperUserRequestModal
        usdt_modal={usdtAction}
        superSaveAction={superSaveAction}
        ref={rejectSuperUserRequestModal}
      />
      <UDUpdateUserModal
        open={openModal}
        onClose={handleModalClose}
        type={modalType}
        userId={userDetail?.id || ""}
        existingValues={existingValues}
      />
      <WithdrawalModal ref={withdrawalModal} />
      <RejectSuperSaveModal
        onSave={refetchUserDetails}
        rejectSuperSaveData={rejectSuperSaveData}
        ref={rejectSuperSaveModal}
      />
      <UpdateCommunityModal refetch={refetchUserDetails} userId={userDetail?.id} open={showUpdateTeamModal} onClose={() => setShowUpdateTeamModal(false)} community={userDetail?.community} />
      {userDetail && (
        <TransferModal
          email={userDetail.email}
          onSave={() => refetchUserDetails()}
          ref={transferModal}
        />
      )}
      {userDetail && (
        <AppConnectionModal
          email={userDetail.email}
          onSave={() => refetchUserDetails()}
          ref={appConnectionModal}
        />
      )}
      {userDetail?.ekyc_data && userDetail?.ekyc_data !== "[]" && (
        <EkycModal
          open={showeKycModal}
          onClose={() => setShoweKycModal(false)}
          ekycData={userDetail?.ekyc_data}
          faceRecognition={userDetail?.face_recognition}
        />
      )}
      {userDetail?.usdt_ekyc_data && userDetail?.usdt_ekyc_data !== "[]" && (
        <EkycModal
          open={showUsdteKycModal}
          onClose={() => setShowUsdteKycModal(false)}
          ekycData={userDetail?.usdt_ekyc_data}
          faceRecognition={userDetail?.face_recognition}
        />
      )}
    </div>
  );
}

export default BasicInformationTab;