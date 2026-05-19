"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useLocaleStore } from "@/stores/localeStore";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { t } from "@/lib/i18n";
import { products, categories, type Product } from "@/lib/merchandise";
import { ShoppingBagIcon, CancelIcon } from "@/components/icons";

export default function ShopPage() {
  const { locale } = useLocaleStore();
  const cart = useCartStore();
  const [activeCategory, setActiveCategory] = useState(locale === "zh" ? "全部" : "All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  const filtered =
    activeCategory === (locale === "zh" ? "全部" : "All")
      ? products
      : products.filter((p) => {
          const catName = locale === "zh" ? p.category.zh : p.category.en;
          return catName === activeCategory;
        });

  const flyToCart = useCallback((fromEl: HTMLElement, product: Product) => {
    const cartBtn = cartBtnRef.current;
    if (!cartBtn) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = cartBtn.getBoundingClientRect();

    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    const flyer = document.createElement("div");
    flyer.style.cssText = `
      position: fixed;
      z-index: 9999;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(194,59,34,0.4);
      pointer-events: none;
      left: ${startX - 20}px;
      top: ${startY - 20}px;
    `;

    const img = document.createElement("img");
    img.src = product.image;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    img.onerror = () => { img.src = "/images/shop/placeholder.svg"; };
    flyer.appendChild(img);
    document.body.appendChild(flyer);

    const duration = 900;
    const arcHeight = -180;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const x = startX + (endX - startX) * ease;
      const y = startY + (endY - startY) * ease + arcHeight * (1 - (2 * ease - 1) * (2 * ease - 1));
      const scale = 1 - 0.6 * ease;
      const opacity = 1 - 0.5 * ease;

      flyer.style.left = `${x - 20}px`;
      flyer.style.top = `${y - 20}px`;
      flyer.style.transform = `scale(${scale})`;
      flyer.style.opacity = `${opacity}`;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        flyer.remove();
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 400);
      }
    }

    requestAnimationFrame(animate);
  }, []);

  function handleAddToCart(product: Product, fromEl: HTMLElement) {
    flyToCart(fromEl, product);
    setTimeout(() => cart.addItem(product), 450);
  }

  return (
    <div className="relative z-10">
      {/* Hero */}
      <section className="heritage-hero py-20">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="seal-stamp text-xs tracking-[0.3em] px-4 py-1.5 mx-auto mb-8 inline-block">
            {locale === "zh" ? "文创周边" : "SOUVENIRS"}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-wider">
            {t(locale, "shop.title")}
          </h1>
          <p className="text-white/60 font-body text-base md:text-lg max-w-xl mx-auto">
            {t(locale, "shop.subtitle")}
          </p>
          <div className="mt-8 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Cart button (floating) */}
      <button
        ref={cartBtnRef}
        onClick={cart.toggleCart}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-cinnabar text-white rounded-full shadow-[0_4px_20px_rgba(194,59,34,0.4)] flex items-center justify-center hover:bg-cinnabar-deep transition-colors ${cartBounce ? "cart-bounce" : ""}`}
      >
        <ShoppingBagIcon size={24} />
        {cart.totalItems() > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-ink text-xs font-bold rounded-full flex items-center justify-center">
            {cart.totalItems()}
          </span>
        )}
      </button>

      {/* Category filter + Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Category tabs */}
        <div className="heritage-panel mx-auto mb-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-lg p-1.5">
          {categories.map((cat) => {
            const catName = locale === "zh" ? cat.zh : cat.en;
            const isActive = activeCategory === catName;
            return (
              <button
                key={cat.zh}
                onClick={() => setActiveCategory(catName)}
                className={`relative px-4 py-2 text-sm font-display tracking-wider transition-colors duration-300 ${
                  isActive
                    ? "text-cinnabar font-bold"
                    : "text-charcoal/58 hover:bg-white/50 hover:text-charcoal"
                }`}
              >
                {catName}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cinnabar rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              index={i}
              onAddToCart={handleAddToCart}
              onViewDetail={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          locale={locale}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Sidebar */}
      {cart.isOpen && (
        <CartSidebar
          locale={locale}
          cart={cart}
          onClose={cart.closeCart}
          onCheckout={() => {
            cart.closeCart();
            setShowCheckout(true);
          }}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          locale={locale}
          cart={cart}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

/* ─── Product Card ─── */

function ProductCard({
  product,
  locale,
  index,
  onAddToCart,
  onViewDetail,
}: {
  product: Product;
  locale: "zh" | "en";
  index: number;
  onAddToCart: (p: Product, fromEl: HTMLElement) => void;
  onViewDetail: (p: Product) => void;
}) {
  return (
    <div
      className="paper-surface group relative overflow-hidden rounded-lg transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Image area */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer bg-rice-paper-warm/40"
        onClick={() => onViewDetail(product)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name[locale]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/shop/placeholder.svg";
          }}
        />
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-cinnabar text-white text-xs font-display px-2 py-1 rounded-sm">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
            <span className="bg-white/90 text-charcoal font-display text-sm px-4 py-2 rounded-sm">
              {t(locale, "shop.outOfStock")}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-charcoal/40 font-body mb-1">
          {product.category[locale]}
        </p>
        <h3
          className="font-display font-bold text-base text-ink mb-2 line-clamp-2 cursor-pointer hover:text-cinnabar transition-colors"
          onClick={() => onViewDetail(product)}
        >
          {product.name[locale]}
        </h3>
        <p className="text-xs text-charcoal/50 font-body line-clamp-2 mb-3">
          {product.description[locale]}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <span className="font-display font-bold text-xl text-cinnabar">
              ¥{product.price}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-xs text-charcoal/30 line-through">
                ¥{product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={(e) => onAddToCart(product, e.currentTarget)}
            disabled={!product.inStock}
            className="rounded-sm bg-ink px-3 py-1.5 text-xs font-display tracking-wider text-white transition-colors hover:bg-cinnabar disabled:cursor-not-allowed disabled:opacity-30"
          >
            {t(locale, "shop.addToCart")}
          </button>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-charcoal/40">
          <span>★ {product.rating}</span>
          <span>{t(locale, "shop.sales")} {product.sales}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Product Detail Modal ─── */

function ProductDetailModal({
  product,
  locale,
  onClose,
  onAddToCart,
}: {
  product: Product;
  locale: "zh" | "en";
  onClose: () => void;
  onAddToCart: (p: Product, fromEl: HTMLElement) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="heritage-panel relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-charcoal/50 hover:text-cinnabar transition-colors"
        >
          <CancelIcon size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-rice-paper-warm/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name[locale]}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/shop/placeholder.svg";
              }}
            />
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col">
            <p className="text-xs text-charcoal/40 font-body mb-2 tracking-wider">
              {product.category[locale]}
            </p>
            <h2 className="font-display font-bold text-2xl text-ink mb-4 tracking-wide">
              {product.name[locale]}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-display font-bold text-3xl text-cinnabar">
                ¥{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-charcoal/30 line-through">
                  ¥{product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-charcoal/50 mb-6">
              <span>★ {product.rating} {t(locale, "shop.rating")}</span>
              <span>{t(locale, "shop.sales")} {product.sales}</span>
              <span className={product.inStock ? "text-jade" : "text-cinnabar"}>
                {product.inStock ? t(locale, "shop.inStock") : t(locale, "shop.outOfStock")}
              </span>
            </div>

            <p className="text-charcoal/60 font-body text-sm leading-relaxed mb-6">
              {product.description[locale]}
            </p>

            <div className="mb-6">
              <p className="text-xs text-charcoal/40 mb-2">{t(locale, "shop.relatedSpot")}</p>
              <Link
                href={`/spots/${product.spot}`}
                className="text-sm text-cinnabar hover:text-cinnabar-deep font-body underline underline-offset-4"
                onClick={onClose}
              >
                {locale === "zh" ? "查看景点详情 →" : "View Spot Details →"}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags[locale].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs border border-charcoal/10 text-charcoal/50 rounded-sm font-body"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto flex gap-3">
              <button
                onClick={(e) => onAddToCart(product, e.currentTarget)}
                disabled={!product.inStock}
                className="flex-1 py-3 bg-ink text-white font-display tracking-wider text-sm hover:bg-cinnabar transition-colors rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {t(locale, "shop.addToCart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Sidebar ─── */

function CartSidebar({
  locale,
  cart,
  onClose,
  onCheckout,
}: {
  locale: "zh" | "en";
  cart: {
    items: CartItem[];
    removeItem: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    totalItems: () => number;
    totalPrice: () => number;
  };
  onClose: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="heritage-panel relative z-10 flex h-full w-full max-w-md flex-col shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
          <h2 className="font-display font-bold text-xl text-ink tracking-wide">
            {t(locale, "shop.cart")}
            <span className="ml-2 text-sm text-charcoal/40 font-body">
              ({cart.totalItems()})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-charcoal/50 hover:text-cinnabar transition-colors"
          >
            <CancelIcon size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagIcon size={48} className="text-charcoal/20 mb-4" />
              <p className="font-display text-lg text-charcoal/40 mb-2">
                {t(locale, "shop.cartEmpty")}
              </p>
              <p className="text-sm text-charcoal/30 font-body">
                {t(locale, "shop.cartEmptyDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 rounded-lg border border-charcoal/5 bg-white/50 p-3"
                >
                  <div className="w-20 h-20 flex-shrink-0 bg-rice-paper-warm/40 rounded-sm overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.image}
                      alt={item.product.name[locale]}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/shop/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-ink truncate">
                      {item.product.name[locale]}
                    </h4>
                    <p className="font-display font-bold text-cinnabar mt-1">
                      ¥{item.product.price}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            cart.updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 border border-charcoal/20 text-charcoal/60 flex items-center justify-center text-xs hover:border-cinnabar hover:text-cinnabar transition-colors rounded-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-body w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            cart.updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 border border-charcoal/20 text-charcoal/60 flex items-center justify-center text-xs hover:border-cinnabar hover:text-cinnabar transition-colors rounded-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => cart.removeItem(item.product.id)}
                        className="text-xs text-charcoal/30 hover:text-cinnabar transition-colors"
                      >
                        {t(locale, "shop.remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="p-6 border-t border-charcoal/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-charcoal/60 font-body">
                {t(locale, "shop.total")}
              </span>
              <span className="font-display font-bold text-2xl text-cinnabar">
                ¥{cart.totalPrice()}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-cinnabar text-white font-display tracking-[0.2em] text-sm hover:bg-cinnabar-deep transition-colors rounded-sm shadow-[0_4px_20px_rgba(194,59,34,0.3)]"
            >
              {t(locale, "shop.checkout")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Virtual Checkout ─── */

function CheckoutModal({
  locale,
  cart,
  onClose,
}: {
  locale: "zh" | "en";
  cart: {
    items: CartItem[];
    totalItems: () => number;
    totalPrice: () => number;
    clearCart: () => void;
  };
  onClose: () => void;
}) {
  const [receiver, setReceiver] = useState(locale === "zh" ? "中轴旅人" : "Axis Traveler");
  const [phone, setPhone] = useState("138 0000 2026");
  const [address, setAddress] = useState(locale === "zh" ? "北京市东城区中轴线游客服务中心" : "Central Axis Visitor Center, Dongcheng, Beijing");
  const [payment, setPayment] = useState("wechat");
  const [remark, setRemark] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [paidTotal, setPaidTotal] = useState(0);

  const subtotal = cart.totalPrice();
  const shipping = subtotal >= 299 || subtotal === 0 ? 0 : 18;
  const discount = subtotal >= 500 ? 38 : 0;
  const total = Math.max(subtotal + shipping - discount, 0);

  const handleSubmit = () => {
    setOrderNo(`ZX${Date.now().toString().slice(-8)}`);
    setPaidTotal(total);
    setSubmitted(true);
    cart.clearCart();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={onClose} />
      <div className="heritage-panel relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-lg shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center text-charcoal/50 transition-colors hover:text-cinnabar"
        >
          <CancelIcon size={20} />
        </button>

        {submitted ? (
          <div className="px-6 py-14 text-center md:px-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-jade/10 text-jade">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-wide text-ink">
              {locale === "zh" ? "订单提交成功" : "Order Placed"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-charcoal/58">
              {locale === "zh" ? "感谢购买，我们已收到您的订单。" : "Thank you. Your order has been received."}
            </p>
            <div className="mx-auto mt-8 grid max-w-md gap-3 rounded-lg border border-charcoal/8 bg-white/55 p-5 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">{locale === "zh" ? "订单号" : "Order No."}</span>
                <span className="font-display font-bold text-ink">{orderNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">{locale === "zh" ? "支付金额" : "Total Paid"}</span>
                <span className="font-display font-bold text-cinnabar">¥{paidTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal/50">{locale === "zh" ? "收货人" : "Receiver"}</span>
                <span className="text-ink">{receiver}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-9 rounded-sm bg-cinnabar px-10 py-3 text-sm font-display tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(194,59,34,0.25)] transition-colors hover:bg-cinnabar-deep"
            >
              {locale === "zh" ? "完成" : "Done"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <div className="seal-stamp mb-4 w-fit px-3 py-1 text-xs tracking-[0.28em]">
                  {locale === "zh" ? "订单结算" : "CHECKOUT"}
                </div>
                <h2 className="font-display text-3xl font-bold tracking-wide text-ink">
                  {locale === "zh" ? "确认订单" : "Confirm Order"}
                </h2>
                <p className="mt-2 text-sm leading-7 text-charcoal/56">
                  {locale === "zh" ? "确认商品明细，填写收货信息并选择支付方式。" : "Confirm your items, shipping details, and payment method."}
                </p>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="mb-3 font-display text-sm font-bold tracking-wider text-cinnabar">
                    {locale === "zh" ? "收货信息" : "Shipping Information"}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs text-charcoal/48">{locale === "zh" ? "收货人" : "Receiver"}</span>
                      <input value={receiver} onChange={(e) => setReceiver(e.target.value)} className="w-full rounded-sm border border-charcoal/10 bg-white/70 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cinnabar/35" />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs text-charcoal/48">{locale === "zh" ? "联系电话" : "Phone"}</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-sm border border-charcoal/10 bg-white/70 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cinnabar/35" />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-1.5 block text-xs text-charcoal/48">{locale === "zh" ? "收货地址" : "Address"}</span>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-sm border border-charcoal/10 bg-white/70 px-4 py-2.5 text-sm outline-none transition-colors focus:border-cinnabar/35" />
                    </label>
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 font-display text-sm font-bold tracking-wider text-cinnabar">
                    {locale === "zh" ? "支付方式" : "Payment Method"}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: "wechat", zh: "微信支付", en: "WeChat Pay" },
                      { id: "alipay", zh: "支付宝", en: "Alipay" },
                      { id: "card", zh: "银行卡", en: "Bank Card" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPayment(method.id)}
                        className={`rounded-lg border px-4 py-3 text-left transition-all ${
                          payment === method.id
                            ? "border-cinnabar bg-cinnabar/6 text-cinnabar"
                            : "border-charcoal/8 bg-white/48 text-charcoal/62 hover:border-cinnabar/24"
                        }`}
                      >
                        <span className="block font-display text-sm font-bold">{locale === "zh" ? method.zh : method.en}</span>
                        <span className="mt-1 block text-xs opacity-55">{locale === "zh" ? "推荐方式" : "Recommended"}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="block">
                    <span className="mb-1.5 block font-display text-sm font-bold tracking-wider text-cinnabar">{locale === "zh" ? "订单备注" : "Order Note"}</span>
                    <textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      rows={3}
                      placeholder={locale === "zh" ? "可填写包装、配送时间等备注" : "Optional note for wrapping or delivery time"}
                      className="w-full resize-none rounded-sm border border-charcoal/10 bg-white/70 px-4 py-3 text-sm outline-none transition-colors placeholder:text-charcoal/30 focus:border-cinnabar/35"
                    />
                  </label>
                </section>
              </div>
            </div>

            <aside className="border-t border-charcoal/8 bg-white/36 p-6 lg:border-l lg:border-t-0 md:p-8">
              <h3 className="mb-4 font-display text-lg font-bold tracking-wide text-ink">
                {locale === "zh" ? "订单明细" : "Order Summary"}
              </h3>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 rounded-lg border border-charcoal/5 bg-white/52 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.image} alt={item.product.name[locale]} className="h-14 w-14 flex-shrink-0 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold text-ink">{item.product.name[locale]}</p>
                      <p className="mt-1 text-xs text-charcoal/42">x {item.quantity}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-cinnabar">¥{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-charcoal/8 pt-5 text-sm">
                <div className="flex justify-between text-charcoal/58">
                  <span>{locale === "zh" ? "商品小计" : "Subtotal"}</span>
                  <span>¥{subtotal}</span>
                </div>
                <div className="flex justify-between text-charcoal/58">
                  <span>{locale === "zh" ? "运费" : "Shipping"}</span>
                  <span>{shipping === 0 ? (locale === "zh" ? "免运费" : "Free") : `¥${shipping}`}</span>
                </div>
                <div className="flex justify-between text-charcoal/58">
                  <span>{locale === "zh" ? "满减优惠" : "Discount"}</span>
                  <span>{discount > 0 ? `-¥${discount}` : "¥0"}</span>
                </div>
                <div className="flex justify-between border-t border-charcoal/8 pt-4">
                  <span className="font-display font-bold text-ink">{locale === "zh" ? "应付合计" : "Total"}</span>
                  <span className="font-display text-2xl font-bold text-cinnabar">¥{total}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={cart.items.length === 0 || !receiver.trim() || !phone.trim() || !address.trim()}
                className="mt-6 w-full rounded-sm bg-cinnabar py-3 text-sm font-display tracking-[0.18em] text-white shadow-[0_8px_24px_rgba(194,59,34,0.25)] transition-colors hover:bg-cinnabar-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {locale === "zh" ? "提交订单" : "Place Order"}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-charcoal/38">
                {locale === "zh" ? "下单后可在订单详情中查看进度。" : "You can check order progress in the order details."}
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
