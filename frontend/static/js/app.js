/* فروشگاه نمونه — سبد خرید مبتنی بر localStorage (نسخه‌ی فرانت‌اند)
   نکته: قیمت‌ها فقط برای نمایش‌اند؛ در نسخه‌ی جنگو همه‌چیز سمت سرور اعتبارسنجی می‌شود. */
"use strict";

const STORE = {
    currencyLabel: "تومان",
    shippingCost: 50000,           // هزینه‌ی ارسال پایه
    freeShippingThreshold: 500000, // ارسال رایگان بالای این مبلغ
};

const PRODUCTS = [
    { id: 1, slug: "qahve-turk",   name: "قهوه‌ی ترک مدیوم ۲۵۰ گرمی",   price: 385000, oldPrice: 450000, stock: 14, cat: "خوراکی",      img: "https://picsum.photos/seed/coffee1/600/600", desc: "قهوه‌ی ترک با برشت متوسط، عطر بالا و طعم متعادل. مناسب دم‌آوری با قهوه‌جوش." },
    { id: 2, slug: "qahve-espresso", name: "دانه قهوه اسپرسو ۱ کیلویی",  price: 1180000, oldPrice: null,  stock: 8,  cat: "خوراکی",      img: "https://picsum.photos/seed/coffee2/600/600", desc: "بلند اسپرسوی تازه‌برشت با کرمای غنی. مناسب دستگاه‌های اسپرسوساز خانگی." },
    { id: 3, slug: "ketab-roman", name: "رمان «کوری» ژوزه ساراماگو",    price: 175000, oldPrice: 210000, stock: 22, cat: "کتاب",        img: "https://picsum.photos/seed/book1/600/600", desc: "ترجمه‌ی فارسی رمان کوری، نشرنگارستان. جلد شومیز، صحافی مناسب." },
    { id: 4, slug: "saat-mochi", name: "ساعت مچی مینیمال بند چرمی",     price: 890000, oldPrice: null,  stock: 5,  cat: "اکسسوری",     img: "https://picsum.photos/seed/watch1/600/600", desc: "ساعت مچی با صفحه‌ی مینیمال، بند چرم طبیعی و موتور ژاپنی." },
    { id: 5, slug: "hoodie", name: "هودی دورس نخ پنبه",                price: 640000, oldPrice: 820000, stock: 0,  cat: "پوشاک",       img: "https://picsum.photos/seed/hoodie1/600/600", desc: "هودی دورس گرم با جنس نخ‌پنبه‌ی درجه‌یک. موجودی فعلی ناموجود." },
    { id: 6, slug: "headphone", name: "هدفون بی‌سیم روگوشی",            price: 2450000, oldPrice: null, stock: 11, cat: "دیجیتال",     img: "https://picsum.photos/seed/hp1/600/600", desc: "هدفون بلوتوثی با نویزکنسلینگ فعال و باتری ۳۰ ساعته." },
    { id: 7, slug: "mug-ceramic", name: "ماگ سرامیکی دست‌ساز",           price: 145000, oldPrice: null,  stock: 30, cat: "خانه و آشپزخانه", img: "https://picsum.photos/seed/mug1/600/600", desc: "ماگ لعاب‌دار دست‌ساز با طرح سنتی. حجم ۳۵۰ میلی‌لیتر." },
    { id: 8, slug: "notebook", name: "دفتر طرح‌دار ۱۲۰ برگ",            price: 98000,  oldPrice: 125000, stock: 18, cat: "نوشت‌افزار",   img: "https://picsum.photos/seed/nb1/600/600", desc: "دفتر صحافی‌شده با کاغذ ۸۰ گرمی مناسب خودنویس." },
];

const fmt = (n) => new Intl.NumberFormat("fa-IR").format(n) + " " + STORE.currencyLabel;
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const findProduct = (id) => PRODUCTS.find(p => p.id === Number(id));

/* ---------- سبد خرید ---------- */
const Cart = {
    key: "demo_cart",
    read() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; } },
    write(c) { localStorage.setItem(this.key, JSON.stringify(c)); renderCartUI(); },
    add(id, qty = 1) {
        const p = findProduct(id);
        if (!p || p.stock <= 0) return false;
        const c = this.read();
        c[id] = Math.min((c[id] || 0) + qty, p.stock);
        this.write(c);
        return true;
    },
    setQty(id, qty) {
        const c = this.read(); const p = findProduct(id);
        if (qty <= 0) delete c[id];
        else if (p) c[id] = Math.min(qty, p.stock);
        this.write(c);
    },
    remove(id) { const c = this.read(); delete c[id]; this.write(c); },
    items() {
        return Object.entries(this.read())
            .map(([id, qty]) => ({ ...findProduct(id), qty }))
            .filter(i => i.id !== undefined);
    },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    subtotal() { return this.items().reduce((s, i) => s + i.price * i.qty, 0); },
    shipping() {
        const st = this.subtotal();
        if (st === 0 || st >= STORE.freeShippingThreshold) return 0;
        return STORE.shippingCost;
    },
    clear() { this.write({}); },
};

/* ---------- رابط کاربری سبد ---------- */
function renderCartUI() {
    const items = Cart.items();
    const count = Cart.count();

    $$(".cart-count").forEach(el => {
        el.textContent = new Intl.NumberFormat("fa-IR").format(count);
        el.classList.toggle("hidden", count === 0);
    });

    const preview = $("#cart-preview");
    if (preview) {
        if (!items.length) {
            preview.innerHTML = `<p class="text-muted text-sm p-4 text-center">سبد خرید شما خالی است.</p>`;
        } else {
            preview.innerHTML = items.map(i => `
                <div class="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)] last:border-0">
                    <img src="${i.img}" alt="${i.name}" class="w-11 h-11 rounded-[var(--radius-sm)] object-cover" loading="lazy">
                    <div class="flex-1 min-w-0">
                        <p class="line-clamp-1 text-sm">${i.name}</p>
                        <p class="text-xs text-muted">${new Intl.NumberFormat("fa-IR").format(i.qty)} عدد</p>
                    </div>
                    <span class="price text-sm whitespace-nowrap">${fmt(i.price * i.qty)}</span>
                </div>`).join("") +
                `<a href="cart.html" class="block text-center text-sm text-[var(--color-primary)] py-2.5 hover:underline">مشاهده‌ی سبد و تسویه‌حساب</a>`;
        }
    }
    const subEl = $("#cart-subtotal-inline");
    if (subEl) subEl.textContent = fmt(Cart.subtotal());
}

/* افزودن به سبد با فچ جدید — اعلان دسترس‌پذیر */
function announce(msg) {
    let live = $("#cart-live");
    if (!live) {
        live = document.createElement("div");
        live.id = "cart-live";
        live.className = "sr-only";
        live.setAttribute("aria-live", "polite");
        document.body.appendChild(live);
    }
    live.textContent = msg;
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;
    e.preventDefault();
    const ok = Cart.add(btn.dataset.addToCart, Number(btn.dataset.qty || 1));
    const p = findProduct(btn.dataset.addToCart);
    if (ok) {
        announce(`«${p.name}» به سبد خرید اضافه شد.`);
        toast(`«${p.name}» به سبد اضافه شد ✓`);
    } else {
        toast("این کالا موجودی ندارد.", true);
    }
});

function toast(msg, isError = false) {
    const t = document.createElement("div");
    t.className = "fixed bottom-4 inset-x-4 mx-auto max-w-sm px-4 py-3 rounded-[var(--radius-md)] text-sm text-white shadow-lg z-[100] " +
        (isError ? "bg-[var(--color-danger)]" : "bg-[var(--color-success)]");
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

/* ---------- صفحه‌ی سبد و تسویه‌حساب ---------- */
function initCartPage() {
    const list = $("#cart-items");
    if (!list) return;

    function draw() {
        const items = Cart.items();
        if (!items.length) {
            list.innerHTML = `
                <div class="card p-10 text-center">
                    <p class="text-lg mb-4">سبد خرید شما خالی است.</p>
                    <a href="index.html" class="btn-primary inline-block px-6 py-2.5 text-sm">بازگشت به فروشگاه</a>
                </div>`;
            $("#cart-summary").classList.add("hidden");
            return;
        }
        $("#cart-summary").classList.remove("hidden");
        list.innerHTML = items.map(i => `
            <div class="card p-3 flex flex-wrap items-center gap-3 mb-3" data-row="${i.id}">
                <img src="${i.img}" alt="${i.name}" class="w-16 h-16 rounded-[var(--radius-sm)] object-cover" loading="lazy">
                <div class="flex-1 min-w-[140px]">
                    <a href="product.html?id=${i.id}" class="line-clamp-1 hover:text-[var(--color-primary)]">${i.name}</a>
                    <p class="text-sm text-muted mt-1">${fmt(i.price)} <span class="text-xs">برای هر عدد</span></p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="btn-outline w-8 h-8 leading-none" data-dec="${i.id}" aria-label="کاهش تعداد">−</button>
                    <span class="w-8 text-center tabular-nums" aria-live="polite">${new Intl.NumberFormat("fa-IR").format(i.qty)}</span>
                    <button class="btn-outline w-8 h-8 leading-none" data-inc="${i.id}" aria-label="افزایش تعداد" ${i.qty >= i.stock ? "disabled" : ""}>+</button>
                </div>
                <div class="price w-28 text-left">${fmt(i.price * i.qty)}</div>
                <button class="text-[var(--color-danger)] text-sm hover:underline" data-del="${i.id}">حذف</button>
            </div>`).join("");
        updateTotals();
    }

    function updateTotals() {
        const sub = Cart.subtotal();
        const ship = Cart.shipping();
        $("#sum-subtotal").textContent = fmt(sub);
        $("#sum-shipping").textContent = ship === 0 ? "رایگان" : fmt(ship);
        $("#sum-total").textContent = fmt(sub + ship);
        renderCartUI();
    }

    list.addEventListener("click", (e) => {
        const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), del = e.target.closest("[data-del]");
        if (inc) Cart.setQty(inc.dataset.inc, (Cart.read()[inc.dataset.inc] || 0) + 1);
        if (dec) Cart.setQty(dec.dataset.dec, (Cart.read()[dec.dataset.dec] || 0) - 1);
        if (del) Cart.remove(del.dataset.del);
        draw();
    });

    const form = $("#checkout-form");
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = $("#co-phone").value.trim();
        if (!/^09\d{9}$/.test(phone)) { toast("شماره موبایل معتبر نیست (مثال: 09123456789)", true); return; }
        if (!form.reportValidity()) return;
        toast("سفارش شما با موفقیت ثبت شد. (نسخه‌ی نمایشی — در نسخه‌ی نهایی سمت سرور پردازش می‌شود)");
        Cart.clear();
        draw();
        form.reset();
    });

    draw();
}

/* ---------- صفحه‌ی محصول ---------- */
function initProductPage() {
    const box = $("#product-detail");
    if (!box) return;
    const id = new URLSearchParams(location.search).get("id") || PRODUCTS[0].id;
    const p = findProduct(id) || PRODUCTS[0];
    const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

    box.innerHTML = `
        <nav aria-label="مسیر" class="text-sm text-muted mb-5">
            <a href="index.html" class="hover:text-[var(--color-primary)]">فروشگاه</a>
            <span class="mx-1">/</span><span>${p.name}</span>
        </nav>
        <div class="grid md:grid-cols-2 gap-8">
            <div>
                <div class="swiper product-gallery card overflow-hidden">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide"><img src="${p.img}" alt="${p.name}" class="w-full aspect-square object-cover"></div>
                        <div class="swiper-slide"><img src="${p.img}?v=2" alt="${p.name} — نمای دوم" class="w-full aspect-square object-cover"></div>
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
            </div>
            <div>
                <h1 class="text-2xl font-bold mb-3">${p.name}</h1>
                <p class="text-muted mb-5">${p.desc}</p>
                <div class="flex items-end gap-3 mb-2">
                    <span class="price text-3xl">${fmt(p.price)}</span>
                    ${p.oldPrice ? `<span class="text-muted line-through">${fmt(p.oldPrice)}</span><span class="badge-discount">٪${new Intl.NumberFormat("fa-IR").format(discount)} تخفیف</span>` : ""}
                </div>
                <p class="${p.stock > 0 ? "stock-ok" : "stock-out"} text-sm mb-6">${p.stock > 0 ? "موجود در انبار" : "ناموجود"}</p>
                ${p.stock > 0 ? `
                <div class="flex items-center gap-3 mb-4">
                    <label for="qty" class="text-sm">تعداد:</label>
                    <input id="qty" type="number" min="1" max="${p.stock}" value="1" class="input-field w-24 text-center">
                </div>
                <button class="btn-primary px-8 py-3" data-add-to-cart="${p.id}" data-qty="1" id="pd-add">افزودن به سبد خرید</button>` : `
                <button class="btn-outline px-8 py-3 opacity-60 cursor-not-allowed" disabled>ناموجود</button>`}
                <dl class="mt-8 text-sm space-y-2 border-t border-[var(--color-border)] pt-4">
                    <div class="flex gap-3"><dt class="text-muted w-24">دسته‌بندی:</dt><dd>${p.cat}</dd></div>
                    <div class="flex gap-3"><dt class="text-muted w-24">گارانتی:</dt><dd>اصالت و سلامت فیزیکی کالا</dd></div>
                </dl>
            </div>
        </div>
        <section class="mt-14" aria-labelledby="related-h">
            <h2 id="related-h" class="text-xl font-bold mb-5">محصولات مرتبط</h2>
            <div id="related-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
        </section>`;

    const qtyInput = $("#qty");
    $("#pd-add")?.addEventListener("click", () => { $("#pd-add").dataset.qty = qtyInput.value; });

    $("#related-grid").innerHTML = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4)
        .map(productCardHTML).join("");

    new Swiper(".product-gallery", {
        pagination: { el: ".swiper-pagination", clickable: true },
        loop: true,
    });
}

/* ---------- کارت محصول (استفاده‌ی مشترک) ---------- */
function productCardHTML(p) {
    const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return `
    <article class="product-card card overflow-hidden flex flex-col h-full transition hover:shadow-[var(--shadow-soft)]">
        <a href="product.html?id=${p.id}" class="block">
            <img src="${p.img}" alt="${p.name}" loading="lazy" width="600" height="600">
        </a>
        <div class="p-4 flex flex-col flex-1">
            <a href="product.html?id=${p.id}" class="line-clamp-2 text-sm font-medium hover:text-[var(--color-primary)]">${p.name}</a>
            <div class="mt-3 flex items-center gap-2 flex-wrap">
                <span class="price">${fmt(p.price)}</span>
                ${p.oldPrice ? `<span class="badge-discount">٪${new Intl.NumberFormat("fa-IR").format(discount)}</span>` : ""}
            </div>
            ${p.oldPrice ? `<span class="text-muted line-through text-xs mt-1">${fmt(p.oldPrice)}</span>` : `<span class="text-xs mt-1 invisible">-</span>`}
            <p class="text-xs mt-1 ${p.stock > 0 ? "stock-ok" : "stock-out"}">${p.stock > 0 ? "موجود در انبار" : "ناموجود"}</p>
            <button class="btn-primary w-full mt-3 py-2 text-sm" data-add-to-cart="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>
                ${p.stock > 0 ? "افزودن به سبد" : "ناموجود"}
            </button>
        </div>
    </article>`;
}

/* ---------- صفحه‌ی اصلی ---------- */
function initHome() {
    const grid = $("#product-grid");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const activeCat = params.get("cat") || "";
    const query = (params.get("q") || "").trim();

    const cats = ["همه", ...new Set(PRODUCTS.map(p => p.cat))];
    $("#category-list").innerHTML = cats.map(c => {
        const href = c === "همه" ? "index.html" : `index.html?cat=${encodeURIComponent(c)}`;
        const active = (activeCat === "" && c === "همه") || activeCat === c;
        return `<a href="${href}" class="px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${active ? "bg-[var(--color-primary)] text-white" : "btn-outline"}">${c}</a>`;
    }).join("");

    let shown = PRODUCTS.filter(p => !activeCat || p.cat === activeCat)
                        .filter(p => !query || p.name.includes(query));

    if (query) $("#search-input").value = query;
    $("#result-note").textContent = query ? `${new Intl.NumberFormat("fa-IR").format(shown.length)} نتیجه برای «${query}»` : "";

    grid.innerHTML = shown.length
        ? shown.map(productCardHTML).join("")
        : `<div class="card p-10 text-center col-span-full"><p class="text-lg">کالایی با این مشخصات پیدا نشد.</p></div>`;

    const featured = PRODUCTS.filter(p => p.oldPrice);
    $("#featured-track").innerHTML = featured.map(p => `
        <div class="swiper-slide"><a href="product.html?id=${p.id}" class="block relative rounded-[var(--radius-lg)] overflow-hidden">
            <img src="${p.img}" alt="${p.name}" class="w-full h-44 md:h-56 object-cover" loading="lazy">
            <span class="absolute bottom-3 right-3 badge-discount">٪${new Intl.NumberFormat("fa-IR").format(Math.round((1 - p.price / p.oldPrice) * 100))} تخفیف</span>
        </a></div>`).join("");

    new Swiper("#featured-swiper", { slidesPerView: 2, spaceBetween: 12, loop: featured.length > 3,
        breakpoints: { 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } } });
}

/* ---------- جستجو ---------- */
document.addEventListener("submit", (e) => {
    const f = e.target.closest("#search-form");
    if (!f) return;
    e.preventDefault();
    const q = $("#search-input").value.trim();
    location.href = q ? `index.html?q=${encodeURIComponent(q)}` : "index.html";
});

/* ---------- احراز هویت / پروفایل (نسخه‌ی نمایشی) ---------- */
function initAuth() {
    const tabs = $$(".auth-tab");
    if (!tabs.length) return;
    tabs.forEach(t => t.addEventListener("click", () => {
        tabs.forEach(x => x.classList.remove("bg-[var(--color-primary)]", "text-white"));
        t.classList.add("bg-[var(--color-primary)]", "text-white");
        $$(".auth-pane").forEach(p => p.classList.toggle("hidden", p.id !== t.dataset.pane));
    }));
    $$(".auth-form").forEach(f => f.addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = f.querySelector("input[type=tel]").value.trim();
        if (!/^09\d{9}$/.test(phone)) { toast("شماره موبایل معتبر نیست (مثال: 09123456789)", true); return; }
        if (!f.reportValidity()) return;
        toast("در نسخه‌ی نمایشی فقط فرانت‌اند فعال است؛ این فرم در نسخه‌ی جنگو به سرور متصل می‌شود.");
    }));
}

function initProfile() {
    const f = $("#profile-form");
    if (!f) return;
    f.addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = $("#pf-phone").value.trim();
        if (!/^09\d{9}$/.test(phone)) { toast("شماره موبایل معتبر نیست (مثال: 09123456789)", true); return; }
        if (!f.reportValidity()) return;
        toast("اطلاعات ذخیره شد (نسخه‌ی نمایشی).");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCartUI();
    initHome();
    initProductPage();
    initCartPage();
    initAuth();
    initProfile();
});
