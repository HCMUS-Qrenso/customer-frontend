import common from "./common.json";
import auth from "./auth.json";
import menu from "./menu.json";
import cart from "./cart.json";
import order from "./order.json";
import profile from "./profile.json";

// Flatten structure to maintain backward compatibility with existing code
// e.g., t.cta.termsAgreement instead of t.common.cta.termsAgreement
const vi = {
  // Common sections (header, table, guestCount, cta, errors, misc)
  header: common.header,
  table: common.table,
  guestCount: common.guestCount,
  cta: common.cta,
  errors: common.errors,
  misc: common.misc,
  common: {
    back: "Quay lại",
    error: "Đã xảy ra lỗi",
    retry: "Thử lại",
  },
  // Feature-specific sections
  auth,
  menu,
  cart: cart.cart,
  voucher: cart.voucher,
  checkout: cart.checkout,
  order: order.order,
  myOrder: order.myOrder,
  track: order.track,
  bill: order.bill,
  summary: order.summary,
  review: order.review,
  profile,
};

export default vi;
