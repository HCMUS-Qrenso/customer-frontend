import common from './common.json';
import auth from './auth.json';
import menu from './menu.json';
import cart from './cart.json';
import order from './order.json';
import profile from './profile.json';

// Flatten structure to maintain backward compatibility with existing code
const zh = {
  // Common sections (header, table, guestCount, cta, errors, misc)
  header: common.header,
  table: common.table,
  guestCount: common.guestCount,
  cta: common.cta,
  errors: common.errors,
  misc: common.misc,
  // Feature-specific sections
  auth,
  menu,
  cart: cart.cart,
  checkout: cart.checkout,
  order: order.order,
  track: order.track,
  bill: order.bill,
  profile,
};

export default zh;
