// Internationalization - Translation Dictionaries

export type Language = "vi" | "en";

// Define the translations structure type
export interface Translations {
  header: {
    currentTable: string;
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    loginTitle: string;
    registerTitle: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    rememberMe: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    orContinueWith: string;
    googleLogin: string;
    loginButton: string;
    registerButton: string;
    loginSuccess: string;
    registerSuccess: string;
    loggingIn: string;
    registering: string;
    passwordMismatch: string;
    passwordRequirements: string;
    emailRequired: string;
    passwordRequired: string;
    fullNameRequired: string;
  };
  table: {
    active: string;
    activeDescription: string;
    inactive: string;
    inactiveDescription: string;
    zone: string;
    capacity: string;
    maxGuests: string;
  };
  guestCount: {
    title: string;
    subtitle: string;
  };
  cta: {
    startOrdering: string;
    loading: string;
    viewOrder: string;
    termsAgreement: string;
  };
  errors: {
    invalidQr: {
      title: string;
      description: string;
      retry: string;
    };
    tableInactive: {
      title: string;
      description: string;
    };
    network: {
      title: string;
      description: string;
      retry: string;
    };
  };
  misc: {
    wifiConnected: string;
  };
  // Menu Page
  menu: {
    search: string;
    all: string;
    chefRecommendations: string;
    soldOut: string;
    customizable: string;
    viewCart: string;
    noResults: string;
    noResultsDescription: string;
    clearSearch: string;
    items: string;
    // Item Detail
    itemDetail: string;
    subtotal: string;
    addToCart: string;
    noteForKitchen: string;
    notePlaceholder: string;
  };
  // Cart Page
  cart: {
    title: string;
    emptyTitle: string;
    emptyMessage: string;
    clearAll: string;
    addNote: string;
    note: string;
    notePlaceholder: string;
    youMayLike: string;
    orderSummary: string;
    subtotal: string;
    serviceCharge: string;
    tax: string;
    total: string;
    placeOrder: string;
    termsAgreement: string;
    items: string;
    backToMenu: string;
    notePlaceholder: string;
  };
  // Checkout Page
  checkout: {
    title: string;
    table: string;
    selectPaymentMethod: string;
    eWallet: string;
    eWalletDesc: string;
    card: string;
    cardDesc: string;
    counter: string;
    counterDesc: string;
    zeroFees: string;
    cardFee: string;
    processingFee: string;
    paymentDetails: string;
    secureTransaction: string;
    cardHolder: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
    confirmPayment: string;
    totalAmount: string;
    paymentSuccess: string;
    paymentFailed: string;
    transactionId: string;
    viewReceipt: string;
    trackOrderStatus: string;
    returnToMenu: string;
    processing: string;
  };
  // Bill Page
  bill: {
    title: string;
    orderId: string;
    dining: string;
    updated: string;
    addedAt: string;
    each: string;
    paymentSummary: string;
    vat: string;
    voucher: string;
    inclTaxes: string;
    billInfoText: string;
    payNow: string;
    payCounter: string;
    callStaff: string;
  };
  // Order Page
  order: {
    title: string;
    live: string;
    requestBill: string;
    addMoreItems: string;
    trackOrder: string;
  };
  // Track Page
  track: {
    liveUpdate: string;
    createdAt: string;
    pending: string;
    accepted: string;
    cooking: string;
    ready: string;
    served: string;
    batch: string;
    orderUpdates: string;
    estimatedTime: string;
    preparingMessage: string;
  };
}

export const translations: Record<Language, Translations> = {
  vi: {
    // Header
    header: {
      currentTable: "Bàn hiện tại",
    },
    // Auth
    auth: {
      login: "Đăng nhập",
      register: "Đăng ký",
      logout: "Đăng xuất",
      loginTitle: "Đăng nhập tài khoản",
      registerTitle: "Tạo tài khoản mới",
      email: "Email",
      password: "Mật khẩu",
      confirmPassword: "Xác nhận mật khẩu",
      fullName: "Họ và tên",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      noAccount: "Chưa có tài khoản?",
      hasAccount: "Đã có tài khoản?",
      orContinueWith: "Hoặc tiếp tục với",
      googleLogin: "Đăng nhập với Google",
      loginButton: "Đăng nhập",
      registerButton: "Tạo tài khoản",
      loginSuccess: "Đăng nhập thành công!",
      registerSuccess:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      loggingIn: "Đang đăng nhập...",
      registering: "Đang tạo tài khoản...",
      passwordMismatch: "Mật khẩu không khớp",
      passwordRequirements:
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
      emailRequired: "Vui lòng nhập email",
      passwordRequired: "Vui lòng nhập mật khẩu",
      fullNameRequired: "Vui lòng nhập họ tên",
    },
    // Table Info
    table: {
      active: "Bàn đang hoạt động",
      activeDescription: "Mã QR hợp lệ. Bạn có thể bắt đầu đặt món ngay.",
      inactive: "Bàn tạm ngưng",
      inactiveDescription:
        "Bàn tạm thời không phục vụ. Vui lòng gọi nhân viên.",
      zone: "Khu vực",
      capacity: "Sức chứa",
      maxGuests: "Tối đa",
    },
    // Guest Count
    guestCount: {
      title: "Số lượng khách",
      subtitle: "Giúp nhà hàng phục vụ tốt hơn",
    },
    // CTA
    cta: {
      startOrdering: "Bắt đầu xem menu",
      loading: "Đang tạo phiên...",
      viewOrder: "Đã có đơn? Xem trạng thái",
      termsAgreement:
        "Bằng cách bắt đầu, bạn đồng ý với điều khoản sử dụng của nhà hàng.",
    },
    // Errors
    errors: {
      invalidQr: {
        title: "Mã QR không hợp lệ",
        description:
          "Không tìm thấy thông tin bàn. Vui lòng quét lại mã QR tại bàn.",
        retry: "Thử lại",
      },
      tableInactive: {
        title: "Bàn tạm ngưng phục vụ",
        description: "Vui lòng liên hệ nhân viên để được hỗ trợ.",
      },
      network: {
        title: "Lỗi kết nối",
        description:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
        retry: "Thử lại",
      },
    },
    // Misc
    misc: {
      wifiConnected: "Đã kết nối Wi-Fi nhà hàng",
    },
    // Menu
    menu: {
      search: "Tìm món...",
      all: "Tất cả",
      chefRecommendations: "Gợi ý của đầu bếp",
      soldOut: "Hết món",
      customizable: "Có tuỳ chọn",
      viewCart: "Xem giỏ",
      noResults: "Không tìm thấy món",
      noResultsDescription: "Thử tìm kiếm với từ khóa khác",
      clearSearch: "Xoá tìm kiếm",
      items: "món",
      itemDetail: "Chi tiết món",
      subtotal: "Tạm tính",
      addToCart: "Thêm vào giỏ hàng",
      noteForKitchen: "Ghi chú cho bếp",
      notePlaceholder: "Ví dụ: Không hành, ít nước bọng...",
    },
    // Cart
    cart: {
      title: "Giỏ hàng",
      emptyTitle: "Giỏ hàng trống",
      emptyMessage: "Bạn chưa có món nào trong giỏ hàng",
      clearAll: "Xoá tất cả",
      addNote: "Thêm ghi chú",
      note: "Ghi chú",
      notePlaceholder: "Ghi chú cho món ăn...",
      youMayLike: "Có thể bạn thích",
      orderSummary: "Tóm tắt đơn hàng",
      subtotal: "Tạm tính",
      serviceCharge: "Phí dịch vụ",
      tax: "Thuế VAT (10%)",
      total: "Tổng cộng",
      placeOrder: "Đặt món",
      termsAgreement: "Bằng cách đặt món, bạn đồng ý với điều khoản sử dụng.",
      items: "món",
      backToMenu: "Quay lại menu",
      notePlaceholder: "Ghi chú cho món ăn...",
    },
    // Checkout
    checkout: {
      title: "Thanh toán",
      table: "Bàn",
      selectPaymentMethod: "Chọn phương thức thanh toán",
      eWallet: "Ví điện tử",
      eWalletDesc: "ZaloPay, MoMo, VNPay",
      card: "Thẻ tín dụng/ghi nợ",
      cardDesc: "Visa, Mastercard, JCB",
      counter: "Thanh toán tại quầy",
      counterDesc: "Thanh toán tiền mặt",
      zeroFees: "Miễn phí",
      cardFee: "Phí 2%",
      processingFee: "Phí xử lý",
      paymentDetails: "Chi tiết thanh toán",
      secureTransaction: "Giao dịch bảo mật",
      cardHolder: "Tên chủ thẻ",
      cardNumber: "Số thẻ",
      expiry: "Ngày hết hạn",
      cvc: "CVC",
      confirmPayment: "Xác nhận thanh toán",
      totalAmount: "Tổng thanh toán",
      paymentSuccess: "Thanh toán thành công!",
      paymentFailed: "Thanh toán thất bại",
      transactionId: "Mã giao dịch",
      viewReceipt: "Xem hoá đơn",
      trackOrderStatus: "Theo dõi đơn hàng",
      returnToMenu: "Quay lại menu",
      processing: "Đang xử lý...",
    },
    // Bill
    bill: {
      title: "Hoá đơn",
      orderId: "Mã đơn hàng",
      dining: "Đang dùng bữa",
      updated: "Cập nhật",
      addedAt: "Thêm lúc",
      each: "mỗi phần",
      paymentSummary: "Tóm tắt thanh toán",
      vat: "Thuế VAT",
      voucher: "Voucher",
      inclTaxes: "Đã bao gồm thuế",
      billInfoText: "Hoá đơn sẽ được gửi đến email của bạn sau khi thanh toán.",
      payNow: "Thanh toán ngay",
      payCounter: "Thanh toán tại quầy",
      callStaff: "Gọi nhân viên",
    },
    // Order
    order: {
      title: "Đơn hàng",
      live: "Trực tiếp",
      requestBill: "Yêu cầu hoá đơn",
      addMoreItems: "Thêm món",
      trackOrder: "Theo dõi",
    },
    // Track
    track: {
      liveUpdate: "Cập nhật trực tiếp",
      createdAt: "Tạo lúc",
      pending: "Đang chờ",
      accepted: "Đã nhận",
      cooking: "Đang nấu",
      ready: "Sẵn sàng",
      served: "Đã phục vụ",
      batch: "Đợt",
      orderUpdates: "Cập nhật đơn hàng",
      estimatedTime: "Dự kiến",
      preparingMessage: "Đơn hàng của bạn đang được bếp chuẩn bị.",
    },
  },
  en: {
    // Header
    header: {
      currentTable: "Current Table",
    },
    // Auth
    auth: {
      login: "Login",
      register: "Register",
      logout: "Logout",
      loginTitle: "Sign in to your account",
      registerTitle: "Create a new account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      fullName: "Full name",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      orContinueWith: "Or continue with",
      googleLogin: "Sign in with Google",
      loginButton: "Sign in",
      registerButton: "Create account",
      loginSuccess: "Login successful!",
      registerSuccess:
        "Registration successful! Please check your email to verify your account.",
      loggingIn: "Signing in...",
      registering: "Creating account...",
      passwordMismatch: "Passwords do not match",
      passwordRequirements:
        "Password must be at least 8 characters, including uppercase, lowercase, number and special character",
      emailRequired: "Please enter your email",
      passwordRequired: "Please enter your password",
      fullNameRequired: "Please enter your full name",
    },
    // Table Info
    table: {
      active: "Table Active",
      activeDescription: "Scan valid. You can start ordering immediately.",
      inactive: "Table Inactive",
      inactiveDescription:
        "This table is temporarily unavailable. Please ask staff.",
      zone: "Zone",
      capacity: "Capacity",
      maxGuests: "Max",
    },
    // Guest Count
    guestCount: {
      title: "Number of guests",
      subtitle: "Help us serve you better",
    },
    // CTA
    cta: {
      startOrdering: "Start ordering",
      loading: "Creating session...",
      viewOrder: "Have an order? View status",
      termsAgreement:
        "By starting, you agree to the restaurant's terms of service.",
    },
    // Errors
    errors: {
      invalidQr: {
        title: "Invalid QR Code",
        description:
          "Table not found. Please scan the QR code at your table again.",
        retry: "Try again",
      },
      tableInactive: {
        title: "Table Unavailable",
        description: "Please contact staff for assistance.",
      },
      network: {
        title: "Connection Error",
        description: "Unable to connect to server. Please check your network.",
        retry: "Retry",
      },
    },
    // Misc
    misc: {
      wifiConnected: "Connected to restaurant Wi-Fi",
    },
    // Menu
    menu: {
      search: "Search menu...",
      all: "All",
      chefRecommendations: "Chef Recommendations",
      soldOut: "Sold Out",
      customizable: "Customizable",
      viewCart: "View Order",
      noResults: "No items found",
      noResultsDescription: "Try a different search term",
      clearSearch: "Clear search",
      items: "items",
      itemDetail: "Item Detail",
      subtotal: "Subtotal",
      addToCart: "Add to Cart",
      noteForKitchen: "Note for Kitchen",
      notePlaceholder: "e.g., No onions, less spicy...",
    },
    // Cart
    cart: {
      title: "Cart",
      emptyTitle: "Your cart is empty",
      emptyMessage: "You have no items in your cart",
      clearAll: "Clear all",
      addNote: "Add note",
      note: "Note",
      notePlaceholder: "Note for this item...",
      youMayLike: "You may also like",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      serviceCharge: "Service charge",
      tax: "VAT (10%)",
      total: "Total",
      placeOrder: "Place Order",
      termsAgreement: "By placing order, you agree to the terms of service.",
      items: "items",
      backToMenu: "Back to menu",
      notePlaceholder: "Note for the dish...",
    },
    // Checkout
    checkout: {
      title: "Checkout",
      table: "Table",
      selectPaymentMethod: "Select Payment Method",
      eWallet: "E-Wallet",
      eWalletDesc: "ZaloPay, MoMo, VNPay",
      card: "Credit/Debit Card",
      cardDesc: "Visa, Mastercard, JCB",
      counter: "Pay at Counter",
      counterDesc: "Cash payment",
      zeroFees: "Zero fees",
      cardFee: "2% fee",
      processingFee: "Processing fee",
      paymentDetails: "Payment Details",
      secureTransaction: "Secure transaction",
      cardHolder: "Card Holder",
      cardNumber: "Card Number",
      expiry: "Expiry",
      cvc: "CVC",
      confirmPayment: "Confirm Payment",
      totalAmount: "Total Amount",
      paymentSuccess: "Payment Successful!",
      paymentFailed: "Payment Failed",
      transactionId: "Transaction ID",
      viewReceipt: "View Receipt",
      trackOrderStatus: "Track Order Status",
      returnToMenu: "Return to Menu",
      processing: "Processing...",
    },
    // Bill
    bill: {
      title: "Bill",
      orderId: "Order ID",
      dining: "Dining",
      updated: "Updated",
      addedAt: "Added at",
      each: "each",
      paymentSummary: "Payment Summary",
      vat: "VAT",
      voucher: "Voucher",
      inclTaxes: "Incl. taxes",
      billInfoText: "Your receipt will be sent to your email after payment.",
      payNow: "Pay Now",
      payCounter: "Pay at Counter",
      callStaff: "Call Staff",
    },
    // Order
    order: {
      title: "Order",
      live: "Live",
      requestBill: "Request Bill",
      addMoreItems: "Add More Items",
      trackOrder: "Track Order",
    },
    // Track
    track: {
      liveUpdate: "Live Update",
      createdAt: "Created",
      pending: "Pending",
      accepted: "Accepted",
      cooking: "Cooking",
      ready: "Ready",
      served: "Served",
      batch: "Batch",
      orderUpdates: "Order Updates",
      estimatedTime: "Estimated",
      preparingMessage: "Your order is being prepared by the kitchen.",
    },
  },
};

export type TranslationKey = keyof Translations;
