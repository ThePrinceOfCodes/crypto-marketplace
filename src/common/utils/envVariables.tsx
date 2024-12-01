const createInfoDiv = (
  text1: string,
  text2?: string,
  text3?: string,
  text4?: string,
  text5?: string,
  text6?: string,
  text7?: string,
) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <p> {text1} </p>
      {text2 && <p> {text2} </p>}
      {text3 && <p> {text3} </p>}
      {text4 && <p> {text4} </p>}
      {text5 && <p> {text5} </p>}
      {text6 && <p> {text6} </p>}
      {text7 && <p> {text7} </p>}
    </div>
  );
};

export const getEnvVariableDetails = (variableName: string) => {
  switch (variableName) {
   case "ACCUMULATE_POINTS_FOR":
      return createInfoDiv(
        "This determines the stores from which P2U will be earned.",
        " Use P2U Management menu for change it.",
      );
   case "APP_SHIELD":
      return createInfoDiv(
        "Here we determine how app shield protection we include in the mobile app will work",
        "Ref. https://github.com/talsec/Free-RASP-Community/wiki/Threat-detection",
        "Block=1, Log=2, Ignore=3",
      );
   case "AUTO_GENERATE_CREDIT_SALE":
      return createInfoDiv(
        "This determines the creation of Credit Sale right by the system.",
        "Enabled: 1, Disabled: 0",
      );
    case "BANK_VERIFICATION_METHOD":
      return createInfoDiv(
        "This determines which verification API will be used when the user adds a bank.",
        "If the above variable is enabled, it will work.",
        "Variables=1won or old",
      );
    case "BANK_VERIFICATION_STATUS":
      return createInfoDiv(
        "This determines whether verification occurs when the user adds a bank.",
        "Enabled=1, Disabled=0",
      );
    case "CALCULATE_POINTS_WITH":
      return createInfoDiv(
        "This determines P2U's cron setting.",
        "Use P2U Management menu for change it.",
      );
    case "CALCULATE_THRESHOLD":
      return createInfoDiv(
        "This determines P2U's threshold setting.",
        "Use P2U Management menu for change it.",
      );
    case "CREDIT_SALE_DECIMAL_PLACES":
      return createInfoDiv(
        "This determines the decimal shown in the application step in app.",
      );
    case "CREDIT_SALE_MSQ":
      return createInfoDiv(
        "This determines whether these users can use MSQ in Super Save.",
        "Enabled=1, Disabled=0",
      );
    case "CREDIT_SALE_MSQX":
      return createInfoDiv(
        "This determines whether these users can use MSQX in Super Save.",
        "Enabled=1, Disabled=0",
      );
    case "CREDIT_SALE_SUT":
      return createInfoDiv(
        "This determines whether these users can use SUT in Super Save.",
        "Enabled=1, Disabled=0",
      );
    case "CREDITSALE_AUTO_APPROVAL":
      return createInfoDiv(
        "This determines the automatic approval of Credit Sale requests.",
        "Enabled=1, Disabled=0",
      );
    case "SUPERSAVE_AUTO_APPROVAL":
      return createInfoDiv(
        "This determines the automatic approval of Super Save requests.",
        "Enabled=1, Disabled=0",
      );
    case "DASHBOARD_PER_PAGE":
      return createInfoDiv(
        "This determines how many requests per page in the Super Save dashboard.",
      );
    case "DB_INITIAL_TOKENS":
      return createInfoDiv(
        "Amount of offChain tokens that will be given to the newly registered user.",
        "It is the default value for all offChain tokens, suggested value is 0.",
        '"Free Tokens" in the "Users" tab is used to determine separate values for tokens.',
      );
    case "EDUCATION_APPROVAL":
      return createInfoDiv(
        "This determines the approval status of education.",
        "Variables=manual, auto, smart, GPS",
        "“manual” case → Admin needs to approve",
        "“auto” case → Auto approve after submit education file",
        "“smart” case → Auto approve at 23:00 KST everyday",
        "“GPS” case → Auto approve based user's location",
        "“GPS-P” case → GPS positive = GPS + smart",
      );
    case "EDUCATION_DATE":
      return createInfoDiv(
        "This determines the date of education.",
        "Variables=0, any day of month",
        "“0” case → Disabled",
        "“any day of month” case → 1,2,3…14,15,16…29,30,31",
      );
    case "EDUCATION_GPS_DISTANCE":
      return createInfoDiv(
        "User's distance from communiy offices for auto approve (metres).",
      );
    case "EDUCATION_PHOTO":
      return createInfoDiv(
        "This determines whether users can upload or take a photo of education.",
        "Variables=upload, take",
        "“upload” case → Users upload photos",
        "“take” case → Users take photos",
      );
    case "ENABLE_ASSET_STATUS":
      return createInfoDiv(
        "This determines the asset status section on app.",
        "Show=1, Hide=0",
      );
    case "ENABLE_CASH_TRANSFER":
      return createInfoDiv(
        "This determines cash transfer input on app.",
        "Show=1, Hide=0",
      );
    case "ENABLE_COIN_TRANSFER":
      return createInfoDiv(
        "This determines coin transfer input on app.",
        "Show=1, Hide=0",
      );
    case "ENABLE_MINING_AD":
      return createInfoDiv(
        "This determines P2U mining advertising on app.",
        "Variables=1, 2, 3, 4",
        "“1” case → Text",
        "“2” case → Full Screen",
        "“3” case → Google Admob Banner",
        "“4” case → Google Admob Full Screen",
      );
    case "ENABLE_MULTIPLE_REFERRAL":
      return createInfoDiv(
        "This determines allow add multiple referral on app.",
        "Enabled=1, Disabled=0",
      );
    case "ENABLE_P2U_ACCUMULATION":
      return createInfoDiv(
        "This determines P2U mining status.",
        "Use P2U Management menu for change it.",
      );
    case "ENABLE_VOICE_OTP":
      return createInfoDiv(
        "This determines voice OTP option on app.",
        "Enabled=1, Disabled=0",
      );
    case "FORCE_FAMILY_RELATIONSHIP":
      return createInfoDiv(
        "This determines force users to upload family relationship document.",
        "Force=1, Not Force=0",
      );
    case "FORCE_REFERRAL_CODE":
      return createInfoDiv(
        "This determines force users to add referral code in app.",
        "Force=1, Not Force=0",
      );
    case "HOME_BANNER":
      return createInfoDiv(
        "This is settings of home screen video banner in app.",
        "Variable JSON data.",
        '{"show_banner": true, "video_url": "https://static.msq.market/assets/videos/kbs9news_v1.mp4", "video_image": "https://static.msq.market/assets/banners/banner_kbs.jpg", "auto_start": true}',
      );
    case "IS_ADMIN_TESTING_ENABLE":
      return createInfoDiv(
        "This is used in dev environment for Cypress tests, do not change it.",
      );
    case "LAST_RPA_CALL_TIME":
      return createInfoDiv("This is last RPA call time, do not change it.");
    case "MANUAL_CREDIT_SALE_BUTTON":
      return createInfoDiv(
        "This determines enable manual Credit Sale application button.",
        "Enable=1, Disabled=0",
      );
    case "MSQ_COMPANY_WALLET_ID":
      return createInfoDiv(
        "Super Save company wallet address. It is not used, it is hard-coded in the mobile app.",
      );
    case "MULTIPLE_CARD_ACCUMULATION":
      return createInfoDiv(
        "This determines user can add multiple card for P2U mining.",
        "Use P2U Management menu for change it.",
      );
    case "NICE_VERIFICATION_TYPE":
      return createInfoDiv(
        "This determines NICE verification type on app.",
        "Variables=webview, socket",
        "“webview” case → It will open NICE verification as webview.",
        "“socket” case → It will do NICE verification in app instead of webview.",
      );
    case "KYC_VERIFICATION_TYPE":
      return createInfoDiv(
        "This determines KYC verification type on Android app.",
        "Variables=naver, manual",
        "“naver“ case → It will open Naver Cloud verification.",
        "“manual” case → It will open manual KYC screens.",
      );
    case "KYC_VERIFICATION_TYPE_IOS":
      return createInfoDiv(
        "This determines KYC verification type on iOS app.",
        "Variables=naver, manual",
        "“naver“ case → It will open Naver Cloud verification.",
        "“manual” case → It will open manual KYC screens.",
      );
    case "NON_P2U_STORE_PERCENTAGE":
      return createInfoDiv(
        "This determines non-P2U store mining percentage.",
        "Use P2U Management menu for change it.",
      );
    case "P2P_ORDERS_ENABLED":
      return createInfoDiv(
        "This determines P2P orders status in app.",
        "Enabled=1, Disabled (Hide)=0, Disabled (Show)=2",
      );

    case "P2P_ORDERS_FEE_PERCENT":
      return createInfoDiv(
        "This determines P2P orders fee percent.",
        "It can be in 0-100 range.",
      );

    case "P2P_ORDERS_MAIN_TOKEN":
      return createInfoDiv(
        "This determines P2P orders main token.",
        "It can be any token like “P2U”.",
      );
    case "P2P_ORDERS_SUB_TOKENS":
      return createInfoDiv(
        "This determines P2P orders sub tokens.",
        "Variable JSON data.",
        '{"MSQX": 1, "MSQ": 1}',
      );
    case "P2U_EXCLUDE_COMPANY":
      return createInfoDiv(
        "This determines exclude P2U mining companies.",
        "It can be company number or name, can set multiple by comma.",
      );
    case "P2U_ONCHAIN_TRANSFER_FEE":
      return createInfoDiv(
        "This determines P2U onchain transfer fee.",
        "It can be in 0-100 range.",
      );
    case "P2U_STORE_PERCENTAGE":
      return createInfoDiv(
        "This determines non-P2U store mining percentage.",
        "Use P2U Management menu for change it.",
      );
    case "PARALLEL_SCAN_WORKER":
      return createInfoDiv(
        "It determines how many workers the parallel scan will run with DynamoDB. Parallel scan is used in list APIs.",
        "Ref. https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-query-scan.html",
      );
    case "SAME_CARD_ACCUMULATION":
      return createInfoDiv(
        "This determines user can add same card for P2U mining.",
        "Allow=1, Disallow=0",
      );
    case "SHOW_USER_RPA_ERROR":
      return createInfoDiv(
        "This determines user can see RPA mining error on app.",
        "Show=1, Hide=0",
      );
    case "SKIP_FAMILY_RELATIONSHIP":
      return createInfoDiv(
        "This determines user can skip upload family relationship document.",
        "Skip=1, Can’t Skip=0",
      );
    case "SUPER_SAVE_HIDE_AMOUNT":
      return createInfoDiv(
        "This is to hide Super Save total participation amount.",
        "Hidden: 1, Not Hidden: 0",
      );
    case "SUPER_SAVE_LIMIT":
      return createInfoDiv(
        "Total limit that can be applied for the Super Save KRW version.",
      );
    case "SUPER_SAVE_LIMIT_USDT":
      return createInfoDiv(
        "Total limit that can be applied for the Super Save USDT version.",
      );
    case "SUPER_SAVE_REMAINING_AMOUNT":
      return createInfoDiv("Total remaining limit for Super Save KRW version.");
    case "SUPER_SAVE_REMAINING_AMOUNT_USDT":
      return createInfoDiv(
        "Total remaining limit for Super Save USDT version.",
      );
    case "SUPER_SAVE_TRANSACTION_ID":
      return createInfoDiv(
        "Number assigned to weekly payouts for the Super Save KRW version.",
        "It is automatically incremented, do not change it.",
      );
    case "SUPER_SAVE_TRANSACTION_ID_USDT":
      return createInfoDiv(
        "Number assigned to weekly payouts for the Super Save USDT version.",
        "It is automatically incremented, do not change it.",
      );
    case "SUPER_SAVE_TRANSFER_OWNERSHIP":
      return createInfoDiv(
        "This determines user can transfer Super Save requests on app.",
        "Enabled=1, Disabled=0",
      );
    case "SUPER_SAVE_WIDGET_1":
      return createInfoDiv(
        "The first widget in the Super Save dashboard.",
        "On=1, Off=0",
      );
    case "SUPER_SAVE_WIDGET_2":
      return createInfoDiv(
        "The second widget in the Super Save dashboard.",
        "On=1, Off=0",
      );
    case "SUPER_SAVE_WIDGET_3":
      return createInfoDiv(
        "The third widget in the Super Save dashboard.",
        "On=1, Off=0",
      );
    case "SUPER_SAVE_WIDGET_4":
      return createInfoDiv(
        "The fourth widget in the Super Save dashboard.",
        "On=1, Off=0",
      );
    case "SYSTEM_STATUS_CARD":
      return createInfoDiv(
        "This determines user can show P2U mining service status card on app.",
        "Show=1, Hide=0",
      );
    case "TRANSFER_CREDIT_SALE_RIGHT":
      return createInfoDiv(
        "This determines user can transfer Credit Sale right on app.",
        "Enabled=1, Disabled=0",
      );
    case "TXID_REFUND_AUTO_ADD":
      return createInfoDiv(
        "This determines auto add TXID to refund table.",
        "Enabled=1, Disabled=0",
      );
    case "TXID_DUPLICATE_CHECK":
      return createInfoDiv(
        "This determines TXID duplicate checker in app.",
        "Variables=0, 1, 2",
        "“0” case → Disabled",
        "“1” case → Check only approved",
        "“2” case → Check approved and waiting approval",
      );
    case "USER_TOKEN_TRANSFER":
      return createInfoDiv(
        "This determines user can transfer token in app.",
        "Enabled=1, Disabled=0",
      );
    case "WALLET_EXCLUDE":
      return createInfoDiv(
        "Wallet IDs that you want to be excluded for WalletConnect popup.",
      );
    case "WALLET_INCLUDE":
      return createInfoDiv(
        "Wallet IDs that you want to be included for WalletConnect popup.",
      );
    case "WALLET_METHOD":
      return createInfoDiv(
        "This determines which methods will be used on the Wallet Withdrawal button.",
        "Variables=all, deeplink, walletconnect",
        "“all“ case → current, Wallet Withdrawal button opens popup, Meta Mask / Trust Wallet / Other Wallets…",
        "“deeplink” case → Wallet Withdrawal button opens popup, only Meta Mask / Trust Wallet",
        "“walletconnect” case → Wallet Withdrawal button opens popup and only button for “Select Wallet”",
      );
    case "ALLOW_SAME_PHONE_AIRDROP":
      return createInfoDiv(
        "This determines if the same phone can be used for multiple airdrops.",
        "Variables=0, 1",
        "“0” → Not allowed",
        "“1” → Allowed"
      );

    case "AUTO_APPROVAL_CREDITSALE":
      return createInfoDiv(
        "This enables auto-approval for Credit Sale requests.",
        "Variables=0, 1",
        "“0” → Auto-approval disabled",
        "“1” → Auto-approval enabled"
      );

    case "AUTO_APPROVAL_SMS_ACCOUNT":
      return createInfoDiv(
        "This sets the bank account for auto-approval via SMS.",
        "Variables={ Bank accounts with comma } OR {} to disable",
        "“Matching number” → Proceed with request",
        "“Non-matching number” → Do not proceed"
      );

    case "AUTO_APPROVAL_SMS_SENDER":
      return createInfoDiv(
        "This sets the sender number for auto-approval via SMS.",
        "Variables={ Phone numbers with comma } OR {} to disable",
        "“Matching number” → Proceed with request",
        "“Non-matching number” → Do not proceed"
      );

    case "AUTO_APPROVAL_SUPERSAVE":
      return createInfoDiv(
        "This enables auto-approval for Super Save requests.",
        "Variables=0, 1",
        "“0” → Auto-approval disabled",
        "“1” → Auto-approval enabled"
      );

    case "AUTO_APPROVAL_SMS_TIME_LIMIT":
      return createInfoDiv(
        "This sets the time limit in minutes for auto-approving deposits (KRW).",
        "Variables=Number of minutes",
        "“Exceeds limit” → Do not proceed with approval",
        "“Within limit” → Proceed if deposit matches criteria"
      );

    case "CREDITSALE_DUEDATE_ALLOW":
      return createInfoDiv(
        "This determines whether overdue Credit Sale requests are allowed or not.",
        "Variables=0, 1",
        "“0” case → Reject requests after due date",
        "“1” case → Allow requests after due date"
      );

    case "DISABLED_P2U_STORE_PERCENTAGE":
      return createInfoDiv(
        "This determines disabled P2U store mining percentage.",
        "Use P2U Management menu for change it.",
      );

    case "EDUCATION_MAX_ROUND":
      return createInfoDiv(
        "This setting defines the maximum number of education rounds a user can participate in.",
        "Variables: integer value",
        "Example value → 1 (default), can be set to any positive integer to specify the limit.",
        "This value is used to determine if a user has reached the maximum number of allowed education rounds for the current day."
      );

    case "ENABLE_MSQ_LINK":
      return createInfoDiv(
        "This setting determines if the creation and updating of shortened MSQ link URLs is enabled.",
        "Variables: 0, 1",
        "“0”  case → Disabled (URLs will not be shortened or updated).",
        "“1”case → Enabled (MSQ link URLs can be shortened and updated).",
        "Used to check if msq link shortening functionality should be active or not in the system."
      );


    case "ENABLE_UPDATE_POPUP":
      return createInfoDiv(
        "This setting determines whether the update popup feature is enabled or not.",
        "Variables: 0, 1",
        "“0” case → Disabled (Update popup will not be shown to users).",
        "“1” case → Enabled (Update popup will be shown to users if there are new changes).",
        "Controls the visibility of update notifications or changelog popups in the application."
      );

    case "FIXED_PRICE_MSQ":
      return createInfoDiv(
        "This setting determines the fixed price for MSQ in the system.",
        "Variables: Any numeric value",
        "Provides a fallback price when dynamic price fetching fails.",
        "Used in the msqPrice function to ensure that there is always a valid price available.",
        "When the dynamic price is not available, this fixed price will be used as the default."
      );

    case "FIXED_PRICE_MSQX":
      return createInfoDiv(
        "This setting defines a fixed price for MSQX in the system.",
        "Variables: Any numeric value",
        "Provides a fallback price when dynamic fetching fails.",
        "Used in the msqxPrice function to ensure a valid price is always available.",
        "When dynamic price retrieval is unsuccessful, this fixed price is used as the default."
      );

    case "KYC_AUTO_APPROVE":
      return createInfoDiv(
        "This setting enables automatic approval of KYC requests.",
        "Variables: 0, 1",
        "“0” → Auto-approval disabled",
        "“1” → Auto-approval enabled"
      );
    case "KYC_EDGE_SIMILARITY_THRESHOLD":
      return createInfoDiv(
        "This setting defines the similarity threshold for edge detection in KYC verification.",
        "Variable: Numeric value",
        "Specifies the minimum similarity score required for edge detection."
      );

    case "KYC_EXCEPTION_SUBMIT_CS":
      return createInfoDiv(
        "This setting defines whether exceptions for KYC are submitted to customer support.",
        "Variables: 0, 1",
        "“0” → Exceptions not submitted to customer support",
        "“1” → Exceptions submitted to customer support"
      );


    case "KYC_FACE_SIMILARITY_THRESHOLD":
      return createInfoDiv(
        "This setting defines the face similarity threshold for KYC verification.",
        "Variable: Numeric value",
        "Specifies the minimum similarity score required for face recognition."
      );

    case "KYC_HUMAN_CHECK_THRESHOLD":
      return createInfoDiv(
        "This setting defines the threshold for human check verification in KYC.",
        "Variable: Numeric value",
        "Specifies the minimum threshold for passing human check verification."
      );

    case "KYC_OCR_MODIFICATION_ALLOW":
      return createInfoDiv(
        "This setting determines whether OCR modifications are allowed in KYC verification.",
        "Variables: 0, 1",
        "“0” → OCR modifications not allowed",
        "“1” → OCR modifications allowed"
      );

    case "KYC_TILT_SKIP":
      return createInfoDiv(
        "This setting determines whether to skip tilt checks in KYC verification.",
        "Variables: 0, 1",
        "“0” → Tilt checks not skipped",
        "“1” → Tilt checks skipped"
      );

    case "KYC_WRONG_CODE_ALLOW":
      return createInfoDiv(
        "This setting defines whether wrong codes are allowed in KYC verification.",
        "Variables: 0, 1",
        "“0” → Wrong codes not allowed",
        "“1” → Wrong codes allowed"
      );

    case "P2U_APPROVAL_AUTO":
      return createInfoDiv(
        "This setting determines whether new store additions through the affiliate form are automatically approved.",
        "Variables: 0, 1",
        "“0” → Auto-approval disabled",
        "“1” → Auto-approval enabled"
      );

    case "RATE_LIMIT_MAX_ATTEMPS":
      return createInfoDiv(
        "This setting defines the maximum number of login attempts allowed within a specific time period before the user is temporarily blocked.",
        "Variables: Numeric values",
        "The value represents the maximum number of attempts allowed. For example, setting this value to 10 means a user can attempt to log in up to 10 times before being temporarily blocked.",
        "If set to an invalid value, the default value of 10 attempts will be used."
      );

    case "RATE_LIMIT_TTL":
      return createInfoDiv(
        "This setting defines the time-to-live (TTL) for the rate limit, specifying how long a user's login attempts are tracked before the count resets.",
        "Variables: Numeric values (in seconds)",
        "The value represents the duration in seconds for which the login attempts are tracked. For example, setting this value to 86400 means the attempts are tracked for 24 hours before the count resets.",
        "If set to an invalid value, the default TTL of 86400 seconds (24 hours) will be used."
      );

    case "REWARD_COMMUNITY":
      return createInfoDiv(
        "This setting defines the name of the community that qualifies for a special reward. The reward calculation and amount may differ based on this setting.",
        "Variables: String values (community names)",
        "The value should be set to the exact name of the community that qualifies for special rewards. For example, if you set this value to 'EliteCommunity', only users from 'EliteCommunity' will receive the special reward.",
        "If set to an invalid or non-existent community name, the system will not apply any special rewards, and the default reward calculation will be used."
      );

    case "SMS_SERVICE_PROVIDER":
      return createInfoDiv(
        "This determines which SMS service provider is used for sending messages.",
        "Variables: ”aws” for Amazon SNS, ”coolsms” for CoolSMS.",
      );

    case "SUPER_SAVE_USDT_STATUS":
      return createInfoDiv(
        "This determines whether Super Save USDT requests are allowed or not.",
        "Variables=0, 1",
        "“0” case → Hide Super Save USDT menu",
        "“1” case → Show Super Save USDT menu"
      );

    case "SUPERSAVE_DUEDATE_ALLOW":
      return createInfoDiv(
        "This determines whether overdue Super Save requests are allowed or not.",
        "Variables=0, 1",
        "“0” case → Reject requests after due date",
        "“1” case → Allow requests after due date"
      );

    case "USDT_KYC_AUTO_APPROVE":
      return createInfoDiv(
        "This determines whether KYC verification for USDT registrations is automatically approved based on specific conditions.",
        "Variables=0, 1",
        "“0” case → KYC verification will not be automatically approved; manual intervention is required.",
        "“1” case → KYC verification may be automatically approved if certain criteria are met, streamlining the approval process."
    );

    case "USDT_KYC_LEVEL_NAME":
      return createInfoDiv(
        "This specifies the KYC verification level used for generating the Sumsub access token for USDT registrations.",
        "Variables=string (e.g., 'basic-kyc-level')",
        "Defines the KYC verification level that will be applied. For example, 'basic-kyc-level' might correspond to a standard verification process.",
        "Ensure that this level name matches the required KYC level configured in Sumsub to avoid verification issues. The default level is 'basic-kyc-level' if not set."
    );
    case "USDT_KYC_TIMEOUT":
      return createInfoDiv(
        "This specifies the time-to-live (TTL) for the Sumsub access token used in KYC verification for USDT registrations.",
        "Variables=integer (seconds)",
        "Defines how long the generated access token remains valid before it expires. For example, if set to '600', the token will be valid for 10 minutes.",
        "Adjust this value based on the desired duration for KYC verification sessions. The default is 600 seconds (10 minutes) if not set."
    );

    case "USDT_KYC_VERIFICATION_TYPE":
      return createInfoDiv(
        "This specifies the type of KYC verification process used for USDT registrations.",
        "Variables=manual, sumsub (or other specified types)",
        "“manual” case → KYC verification is performed manually, requiring direct review and intervention.",
        "“sumsub” case → The system uses an automated process for KYC verification, which may allow for automatic approval if `USDT_KYC_AUTO_APPROVE` is enabled."
    );

    case "INHERITOR_ENABLE":
      return createInfoDiv(
        "This enables or disables the inheritor functionality.",
        "Variables: Enable=1, Disable=0",
      );

    case "INHERITOR_EDIT":
      return createInfoDiv(
        "This allows or disallows editing of inheritor details.",
        "Variables: Allow Edit=1, Disallow Edit=0",
      );

    case "COMMUNITY_MAP_TYPE":
      return createInfoDiv(
        "This defines the type of map used for community display.",
        "Variables: map, image"
      );

      case "KYC_CHECK_ID_NUMBER_ALLOW":
        return createInfoDiv(
          "This setting controls whether duplicate ID card numbers are allowed during KYC checks for Super Save transaction registration.",
          "Variables: Allow Duplicate=1, Disallow Duplicate=0",
      );

    default:
      return <p>...</p>;
  }
};
