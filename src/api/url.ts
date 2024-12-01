export const API_URL = {
  signIn: "platform-users/msq_platform_users_login",
  resendOTP: "/platform-users/send_OTP",
  verifyOTP: "/platform-users/verify_OTP",
  signUp: "platform-users/msq_platform_users_register",
  verifyAccount: "platform-users/msq_platform_verify_account",
  forceVerified: "platform-users/force_verified",
  resetPwdRequest: "platform-users/msq_platform_reset_password_request",
  resetPwd: "platform-users/msq_platform_reset_password",
  getUser: "platform-users/msq_platform_get_user",
  updateUser: "platform-users/msq_platform_update_profile",
  updateUserPassword: "platform-users/msq_platform_update_password",
  getTokens: "platform-users/get-alltokens",
  addTokens: "platform-users/addtokens",
  getFreeTokens: "platform-users/get_free_tokens",
  addFreeTokens: "platform-users/add_free_tokens",
  getTokensExchangeRates: "platform-users/get_exchange_rates",
  addTokensExchangeRates: "platform-users/add_exchange_rates",
  getAllPlatforms: "/platform-users/get_all_platforms",
  getUserPlatforms: "platform-users/get_user_platforms",
  getMsqPlatformUsers: "platform-users/get_all_platform_users",
  approveMsqPlatformUser: "platform-users/approve_super_admin_user",
  disapproveMsqPlatformUser: "platform-users/disapprove_super_admin_user",
  updateAdminRoles: "platform-users/update_admin_role",
  getPlatformRequests: "platform-users/get_platform_requests",
  addPlatform: "platform-users/msq_add_platform",
  getPlatformAPIKey: "/platform-users/getPlatformApiKey",
  addPlatformAPIKey: "platform-users/createPlatformApiKey",
  deletePlatformAPIKey: "platform-users/delete_platform_api_key",
  deletePlatform: "platform-users/msq_delete_platform",
  getPlatformTransactions: "platform-users/get_platform_transactions",
  getUsersBalance: "platform-users/get_user_balances",
  getPlatformBalance: "platform-users/get_platform_balances",
  getPlatformAffiliatedDashboard: "platform-users/affiliate-dashboard",
  getTokenTransactionHistory: "platform-users/get_token_transactions_history",
  getCompanies: "platform-users/get_companies",
  addUserCards: "user/card/add",
  approvePlatFormRequest: "platform-users/approve_platfrom_request/",
  declinePlatFormRequest: "platform-users/decline_platfrom_request/",
  postSendOTP: "platform-users/send_OTP",
  postInitiatePhoneUpdate:
    "platform-users/msq_platform_users_update_phone_number",
  postAddMultiAdminPlatform: "platform-users/add_multi_admin_platform",
  postAddCategory: "platform-users/update_category_list",
  deleteCategory: "platform-users/delete_category_list",
  getAllTokens: "platform-users/get-alltokens/",
  postAddPlatformToken: "platform-users/add_platform_token",
  postAddAffiliate: "platform-users/add_affiliate",
  postUpdateAffiliate: "platform-users/update_affiliate_details",
  patchAffiliate: "platform-users/update_affiliate",
  deletePlatformToken: "platform-users/delete_platform_token",
  getUserappConnections: "platform-users/get_user_app_connections",
  deleteAppConnection: "platform-users/delete_connection_for_platform_users",
  deleteCardDetails: "platform-users/delete_card",
  denyStore: "platform-users/delete_affiliate",
  checkStoreRegistered: "/p2u-stores/check_store_registered_admin",
  getStoreCategoryListAdmin: "/p2u-stores/get_store_category_list_admin",

  getAllUsers: "platform-users/get_all_users",
  refreshUserBalance: "platform-users/refresh_user_balance",

  allUser: "user/all",
  cards: "user/cards",
  userCard: "user/card",
  cardCompanies: "user/card/companies",
  cardPoints: "user/card/points",
  cardHistories: "user/card/histories",

  clearCache: "/clear-cache",
  getPrices: "get_prices_admin",

  merchants: "affiliate/merchants",
  merchant: "affiliate/merchant",

  getMultiAdminPlatform: "platform-users/get_multi_admin_platform",
  getPlatformSupportedTokens: "platform-users/get_platform_tokens",
  getDashboardStatistics: "platform-users/get_dashboard-stats",
  getDashboardTransactionsStatistics:
    "platform-users/get_transactions-statistics",
  getTopTokens: "platform-users/get_top_tokens_requests",

  getUserTokens: "get_user_token_balance",
  getUserHistory: "get_user_history",
  getUserLogActivity: "super-save/get_user_log_activity",
  getUserNotification: "announcement/announcement-list-admin",

  getUserRPAHistory: "platform-users/get_users_rpa_histories",
  getUserRPAErrorLogs: "platform-users/get_users_rpa_errors",
  getAffiliates: "platform-users/get_affiliates",

  getSettings: "platform-users/get_setting",
  getAllSettings: "platform-users/get_settings",
  saveSettings: "platform-users/save_setting",
  getPointAccumulation: "platform-users/point_accumulation_settings",
  postPointAccumulation: "platform-users/point_accumulation_settings",
  getUserCardInformation: "platform-users/get_user_cards",
  getUserAirdropHistory: "platform-users/get_user_airdrop_history",

  //Super Save
  getSuperSaveUser: "super-save/users",
  getSuperSaveUserWithdrawForm: "/super-save/get_withdraw_form",
  getUserSuperTrustHistory: "super-save/user_super_trust_history",
  setSuperSaveWithdrawForm: "/super-save/update_withdraw_form",
  updateUserDocumentByAdmin: "/super-save/update_user_document_by_admin",
  setSuperSaveRejectUserWithdrawalRequest:
    "/super-save/reject_user_withdrawal_request",
  setWithdrawalUserAsAdmin: "/withdrawal-user/withdraw_user_as_admin",
  postUpdateUserPhoneNumber: "/super-save/update_phone_number_of_user",
  postUpdateUserName: "/super-save/update_name_of_user",
  postUpdateUserEmail: "/super-save/update_corporate_email_of_user",
  postUpdateCorporateName: "/super-save/update_corporate_name",
  postUpdateCorporateBankAccountHolderName:
    "/super-save/update_bank_holder_name_corporate_user",
  postUpdateCorporateRegistrationNumber:
    "/super-save/update_corporate_registration_number",
  postUpdateUserBankDetails: "/super-save/update_bank_detail_of_user",
  postUpdateUserWalletDetails: "/super-save/update_wallet_detail_of_user",
  exchangeUserId: "super-save/exchange_user_id",
  getCommunityReward: "super-save/calculate_community_reward",

  //Super Save Admin
  withdrawalComplete: "/super-save/set_withdrawal_complete",
  updateSuperSaveWidgetSettings:
    "/super-save/update_super_save_widget_settings",
  updateSuperTrustStatus: "/super-save/update_super_trust_status_of_user",
  superSaveImageUpload: "/super-save/image_upload",
  superSaveFileUpload: "/super-save/super_save_file_upload_by_admin",
  changeCorporateBankAccount: "/super-save/update_bank_details_corporate_user",

  rejectSuperSaveTransactionRegistrationRequest:
    "/super-save/reject_super_save_transaction_registration_request",
  rejectSuperSaveTransactionRegistrationRequestUSDT:
    "super-save/reject_super_save_usdt_registration_request",
  approvedSuperSaveTransactionRegistrationRequest:
    "super-save/approve_super_save_transaction_registration_request",
  approvedSuperSaveTransactionRegistrationRequestUSDT:
    "super-save/approve_super_save_usdt_registration_request",
  rejectSuperSaveDepositRequest:
    "/super-save/reject_super_save_deposit_request",
  createDepositTransactionID:
    "super-save/update_super_save_deposit_transaction_id",
  revokeDepositRequest: "super-save/revoke_super_save_deposit_request",
  transferOwnershipRequest: "super-save/transfer_ownership_admin",
  getWithdrawalList: "/super-save/get_withdrawal_list",
  getBulkTransactionList : "/super-save/get_super_save_bulk_transaction_list",
  getAllConsentHistoryList: "/super-save/get_all_consent_history_list",
  getAllCommitmentInfoList: "/super-save/get_all_commitment_list",
  getAllReferralInfoList: "/super-save/get_all_referral_list",
  getUserAllTransferOwnershipHistory:
    "super-save/get_all_transfer_history_list",
  approveTransferOwnership: "super-save/transfer_ownership_approve",
  getUserInheritors: "super-save/user_inheritors",
  rejectTransferOwnership: "super-save/transfer_ownership_reject",
  getSuperSaveUsers: "/super-save/users",
  getSuperSaveUserDetails: "/super-save/get_user_details",
  getAllCashTransfer: "/super-save/get_super_save_cash_deposit_history",
  getSuperSaveWidgetSettings: "/super-save/get_super_save_widget_settings",
  getTotalParticipationWeeklyHistory:
    "/super-save/get_total_participation_weekly_history",
  postAdminHistoryLog: "/platform-users/add_admin_history_log",
  updateIntroducerInfo: "/super-save/update_introducer_info",
  searchSuperSaveRequestByPhoneNumber:
    "/super-save/admin_search_user_by_phone_number",
  checkUserReferralCodeByAdmin: "/super-save/check_user_referral_code_by_admin",

  postUpdateUserCommunity: "/super-save/update_community_of_user",
  getCommunityListByAdmin: "/super-save/get_community_list_admin",
  getUserCommunity: "/super-save/get_user_community_history",
  updateUserSuperSaveStatus: "/super-save/change_super_save_status",


  //Super Save Admin Settings APIs
  setMsqStandardAmount: "super-save/set_msq_standard_amount",
  setSuperSaveAmount: "/super-save/set_super_save_amount",
  setSuperSaveTime: "/super-save/set_super_save_time",
  setSuperSaveNotificationTime: "/super-save/set_super_save_notification_time",
  setSuperSaveBankFee: "/super-save/set_super_save_bank_fee",
  getMsqStandardAmountHistory: "super-save/get_msq_standard_amount_history",
  getSuperSaveAmountHistory: "/super-save/get_super_save_amount_history",
  getSuperSaveBankFeeHistory: "/super-save/get_super_save_bank_fee_history",
  getSuperSaveAmount: "/super-save/get_super_save_amount",
  getSuperSaveBankFee: "/super-save/get_super_save_bank_fee",
  getSuperSaveTimeHistory: "/super-save/get_super_save_time_history",
  getSuperSaveTime: "/super-save/get_super_save_time",
  getSuperSaveNotificationTimeHistory:
    "/super-save/get_super_save_notification_time_history",
  getSuperSaveNotificationTime: "/super-save/get_super_save_notification_time",
  getSuperSaveDailyCalculations: "/super-save/get_all_daily_history",
  getBugReports: "/bug-report",
  postEmailBugReportUser: "/bug-report/reply_to_bug_report_user",

  //Super Save Reserve
  superSaveReserve: "/reserve",
  superSaveGetReservedLimit: "/super-save/get_super_save_limit",
  superSaveUpdateReservedLimit: "/super-save/update_limit_and_remaining_amount",
  //settings
  getlanguage: "/platform-users/get_language",
  setLanguage: "/platform-users/set_language",
  //dummy
  dummyJson: "https://dummyjson.com/users",

  // transaction
  increaseP2U: "/transaction/increaseP2U",
  deductP2U: "/transaction/deductP2U",
  refundQrTransaction: "/transaction/refundQrTransaction",

  // user bank account
  getUserAllBankAccount: "super-save/get_bank_accounts_of_user",
  deleteUserBankAccount: "super-save/delete_bank_account_of_user",
  addUserBankAccount: "super-save/add_bank_account_of_user",
  setUserMainBankAccount: "super-save/set_main_bank_account_of_user",
  updateUserBankAccountById: "super-save/update_bank_detail_of_user_by_bank_id",
  // wallet bank account
  getUserAllWalletAccount: "super-save/get_wallet_accounts_of_user",
  deleteUserWalletAccount: "super-save/delete_wallet_account_of_user",
  addUserWalletAccount: "super-save/add_wallet_account_of_user",
  setUserMainWalletAccount: "super-save/set_main_wallet_account_of_user",
  updateUserWalletAccountById:
    "super-save/update_wallet_detail_of_user_by_wallet_id",

  approveChangeBankRequest: "/super-save/approve_bank_request_corporate_user",
  rejectChangeBankRequest: "/super-save/reject_bank_request_corporate_user",

  getAllTxIdHistory: "/super-save/txid-history",
  updateTxidHistory: "/super-save/txid-history",
  editTxid: "/super-save/update-txid",
  addNewTxid: "/super-save/add-txid",
  verifyTxid: "/super-save/verify-txid",
  deleteTxid: "/super-save/txid-history",

  getAllUserEducation: "/super-save/get_users_educations",
  updateUserEducationStatus: "/super-save/update_education_status",
  resetUserEducationManual: "/super-save/reset_education_manual",
  approveUserEducationAll: "/super-save/approve_all_education",
  getUserEducationHistory: "/super-save/get_user_education_history",

  //community management
  getCommunityList: "/super-save/get_community_list_admin",
  addCommunity: "/super-save/add_community",
  updateCommunity: "/super-save/update_community",
  deleteCommunity: "/super-save/delete_community",

  // news
  getNews: "/news/admin",
  //popups
  getAllPopups: "/popup",
  getAllAds: "/ads/all",
  getAdsStats: "/link/stat",

  // p2p-orders
  getP2pOrders: "/p2p-orders/get_all_order_admin",
  deleteP2pOrders: "/p2p-orders/delete_order_admin",

  getInquiries: "/inquiry/all",
  deleteInquiries: "/inquiry",
  updateStatusInquiries: "/inquiry/change-status",
  sendInquiryResponse: "/inquiry/send-response",
  // bulk notifications
  getAllBulkNotification: "/notification/all_bulk_notifications",
  sendNotificationToAllUser: "/notification/send_notification_to_all_user",
  // comminity status
  getCommunityStatus: "/super-save/get_community_stats",
  //P2P for Admin Dashboard
  getP2PWalletBalance: "/p2p-orders/getCompanyWalletBalance",
  refreshCronJob: "/super-save/update_community_stats_manual",

  //P2P Blockchain Transaction
  getP2PBlockchainTransaction:"/p2p-orders/get_all_transactions",
  sendP2PBlockchainRejectedTransaction: "/p2p-orders/resend_transaction",
};
