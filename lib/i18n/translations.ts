// Internationalization - Translation Dictionaries

export type Language = 'vi' | 'en';

// Define the translations structure type
export interface Translations {
  header: {
    currentTable: string;
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
}

export const translations: Record<Language, Translations> = {
  vi: {
    // Header
    header: {
      currentTable: 'Bàn hiện tại',
    },
    // Table Info
    table: {
      active: 'Bàn đang hoạt động',
      activeDescription: 'Mã QR hợp lệ. Bạn có thể bắt đầu đặt món ngay.',
      inactive: 'Bàn tạm ngưng',
      inactiveDescription: 'Bàn tạm thời không phục vụ. Vui lòng gọi nhân viên.',
      zone: 'Khu vực',
      capacity: 'Sức chứa',
      maxGuests: 'Tối đa',
    },
    // Guest Count
    guestCount: {
      title: 'Số lượng khách',
      subtitle: 'Giúp nhà hàng phục vụ tốt hơn',
    },
    // CTA
    cta: {
      startOrdering: 'Bắt đầu xem menu',
      loading: 'Đang tạo phiên...',
      viewOrder: 'Đã có đơn? Xem trạng thái',
      termsAgreement: 'Bằng cách bắt đầu, bạn đồng ý với điều khoản sử dụng của nhà hàng.',
    },
    // Errors
    errors: {
      invalidQr: {
        title: 'Mã QR không hợp lệ',
        description: 'Không tìm thấy thông tin bàn. Vui lòng quét lại mã QR tại bàn.',
        retry: 'Thử lại',
      },
      tableInactive: {
        title: 'Bàn tạm ngưng phục vụ',
        description: 'Vui lòng liên hệ nhân viên để được hỗ trợ.',
      },
      network: {
        title: 'Lỗi kết nối',
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        retry: 'Thử lại',
      },
    },
    // Misc
    misc: {
      wifiConnected: 'Đã kết nối Wi-Fi nhà hàng',
    },
    // Menu
    menu: {
      search: 'Tìm món...',
      all: 'Tất cả',
      chefRecommendations: 'Gợi ý của đầu bếp',
      soldOut: 'Hết món',
      customizable: 'Có tuỳ chọn',
      viewCart: 'Xem giỏ',
      noResults: 'Không tìm thấy món',
      noResultsDescription: 'Thử tìm kiếm với từ khóa khác',
      clearSearch: 'Xoá tìm kiếm',
      items: 'món',
      itemDetail: 'Chi tiết món',
      subtotal: 'Tạm tính',
      addToCart: 'Thêm vào giỏ hàng',
      noteForKitchen: 'Ghi chú cho bếp',
      notePlaceholder: 'Ví dụ: Không hành, ít nước bọng...',
    },
  },
  en: {
    // Header
    header: {
      currentTable: 'Current Table',
    },
    // Table Info
    table: {
      active: 'Table Active',
      activeDescription: 'Scan valid. You can start ordering immediately.',
      inactive: 'Table Inactive',
      inactiveDescription: 'This table is temporarily unavailable. Please ask staff.',
      zone: 'Zone',
      capacity: 'Capacity',
      maxGuests: 'Max',
    },
    // Guest Count
    guestCount: {
      title: 'Number of guests',
      subtitle: 'Help us serve you better',
    },
    // CTA
    cta: {
      startOrdering: 'Start ordering',
      loading: 'Creating session...',
      viewOrder: 'Have an order? View status',
      termsAgreement: 'By starting, you agree to the restaurant\'s terms of service.',
    },
    // Errors
    errors: {
      invalidQr: {
        title: 'Invalid QR Code',
        description: 'Table not found. Please scan the QR code at your table again.',
        retry: 'Try again',
      },
      tableInactive: {
        title: 'Table Unavailable',
        description: 'Please contact staff for assistance.',
      },
      network: {
        title: 'Connection Error',
        description: 'Unable to connect to server. Please check your network.',
        retry: 'Retry',
      },
    },
    // Misc
    misc: {
      wifiConnected: 'Connected to restaurant Wi-Fi',
    },
    // Menu
    menu: {
      search: 'Search menu...',
      all: 'All',
      chefRecommendations: 'Chef Recommendations',
      soldOut: 'Sold Out',
      customizable: 'Customizable',
      viewCart: 'View Order',
      noResults: 'No items found',
      noResultsDescription: 'Try a different search term',
      clearSearch: 'Clear search',
      items: 'items',
      itemDetail: 'Item Detail',
      subtotal: 'Subtotal',
      addToCart: 'Add to Cart',
      noteForKitchen: 'Note for Kitchen',
      notePlaceholder: 'e.g., No onions, less spicy...',
    },
  },
};

export type TranslationKey = keyof Translations;
