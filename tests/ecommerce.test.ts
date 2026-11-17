import test from 'node:test';
import assert from 'node:assert';
import {
  ADMIN_EMAIL,
  DEFAULT_PROMO_BANNER,
  DEFAULT_SHOP_SETTINGS,
  calculateDeliveryCharge,
  formatBdt,
  generateOrderId,
  isAdminUser,
  isVerifiedAdminEmail,
  toBengaliNumber,
} from '../src/lib/storeUtils.ts';

test('Bengali numeral formatting works accurately', () => {
  assert.strictEqual(toBengaliNumber(0), '০');
  assert.strictEqual(toBengaliNumber(1), '১');
  assert.strictEqual(toBengaliNumber(1200, true), '১,২০০');
  assert.strictEqual(formatBdt(1450), '৳১,৪৫০');
});

test('Delivery charge computes per-product Dhaka vs Outside Dhaka accurately', () => {
  assert.strictEqual(
    calculateDeliveryCharge('ঢাকা', [{ dhakaDeliveryCharge: 70, outsideDhakaDeliveryCharge: 130 }], DEFAULT_SHOP_SETTINGS),
    70
  );
  assert.strictEqual(
    calculateDeliveryCharge('চট্টগ্রাম', [{ dhakaDeliveryCharge: 70, outsideDhakaDeliveryCharge: 130 }], DEFAULT_SHOP_SETTINGS),
    130
  );
  assert.strictEqual(
    calculateDeliveryCharge(
      'ঢাকা',
      [
        { dhakaDeliveryCharge: 70, outsideDhakaDeliveryCharge: 130 },
        { dhakaDeliveryCharge: 90, outsideDhakaDeliveryCharge: 150 },
      ],
      DEFAULT_SHOP_SETTINGS
    ),
    90
  );
  assert.strictEqual(
    calculateDeliveryCharge(
      'সিলেট',
      [
        { dhakaDeliveryCharge: 70, outsideDhakaDeliveryCharge: 130 },
        { dhakaDeliveryCharge: 90, outsideDhakaDeliveryCharge: 150 },
      ],
      DEFAULT_SHOP_SETTINGS
    ),
    150
  );
});

test('Order ID generation follows valid Firestore doc ID format', () => {
  const id = generateOrderId();
  assert.match(id, /^JM-\d{6}-[A-Z0-9]{5}$/);
});

test('Admin access checks super admin and promoted verified admins', () => {
  assert.strictEqual(ADMIN_EMAIL, 'mdabusayedm92@gmail.com');
  assert.strictEqual(isVerifiedAdminEmail('mdabusayedm92@gmail.com', true), true);
  assert.strictEqual(isVerifiedAdminEmail('MDABUSAYEDM92@GMAIL.COM', true), true);
  assert.strictEqual(isVerifiedAdminEmail('mdabusayedm92@gmail.com', false), false);
  assert.strictEqual(isVerifiedAdminEmail('other@gmail.com', true), false);

  assert.strictEqual(isAdminUser('other@gmail.com', true, 'admin'), true);
  assert.strictEqual(isAdminUser('other@gmail.com', false, 'admin'), false);
  assert.strictEqual(isAdminUser('other@gmail.com', true, 'customer'), false);
  assert.strictEqual(DEFAULT_PROMO_BANNER.isActive, true);
});
