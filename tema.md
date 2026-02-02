# KonuşKoç Design System (tema.md)

Bu dosya projedeki tasarım kurallarını ve stil yönergelerini tanımlar.

---

## 🎨 Renk Paleti

### Ana Renkler (Primary)
```css
--primary: #14b8a6        /* Teal-500 */
--primary-light: #5eead4  /* Teal-300 */
--primary-dark: #0d9488   /* Teal-600 */
```

### Gradyanlar
```css
/* Ana gradient */
background: linear-gradient(to right, #14b8a6, #06b6d4);  /* Teal -> Cyan */

/* Premium gradient */
background: linear-gradient(to right, #f59e0b, #f97316);  /* Amber -> Orange */

/* Danger gradient */
background: linear-gradient(to right, #ef4444, #dc2626);  /* Red tones */
```

### Arka Plan Renkleri
```css
--background: #0a0a0a     /* Koyu tema ana arka plan */
--card: #171717          /* Kart arka planları */
--secondary: #262626     /* İkincil arka plan */
```

### Metin Renkleri
```css
--foreground: #fafafa     /* Ana metin */
--muted-foreground: #a1a1aa /* İkincil metin */
```

### Durum Renkleri
```css
/* Zorluk seviyeleri */
--easy: #10b981          /* Emerald-500 */
--medium: #f59e0b        /* Amber-500 */
--hard: #f97316          /* Orange-500 */
--expert: #ef4444        /* Red-500 */
```

---

## 📐 Spacing & Sizing

### Padding/Margin
- `p-2` / `m-2`: 8px (küçük elemanlar)
- `p-4` / `m-4`: 16px (standart)
- `p-6` / `m-6`: 24px (geniş)
- `p-8` / `m-8`: 32px (ekstra geniş)

### Border Radius
- `rounded-lg`: 8px (butonlar)
- `rounded-xl`: 12px (kartlar)
- `rounded-2xl`: 16px (büyük kartlar)
- `rounded-full`: Tam yuvarlak (avatarlar, FAB)

---

## 🔤 Tipografi

### Font Family
```css
font-family: 'Inter', sans-serif;
```

### Font Sizes
- `text-xs`: 12px (etiketler)
- `text-sm`: 14px (yardımcı metin)
- `text-base`: 16px (body)
- `text-lg`: 18px (alt başlıklar)
- `text-xl`: 20px (başlıklar)
- `text-2xl`: 24px (sayfa başlıkları)
- `text-3xl`: 30px (hero metinler)

### Font Weights
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

---

## 🎯 Komponent Stilleri

### Butonlar

#### Primary Button
```jsx
<button className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-teal-500/20">
  Başla
</button>
```

#### Secondary Button
```jsx
<button className="px-4 py-2 bg-secondary text-foreground rounded-xl hover:bg-secondary/80">
  İptal
</button>
```

#### Premium Button
```jsx
<button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl">
  Premium'a Geç
</button>
```

### Kartlar

#### Standart Kart
```jsx
<div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
  {/* içerik */}
</div>
```

#### Gradient Kart
```jsx
<div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-5 shadow-lg">
  {/* içerik */}
</div>
```

### Input Fields
```jsx
<input className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
```

### Toggle Switch
```jsx
<button className={`w-12 h-7 rounded-full p-1 transition-colors ${isActive ? 'bg-primary' : 'bg-secondary'}`}>
  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
</button>
```

---

## 🌊 Animasyonlar

### Fade In & Slide Up
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Scale on Tap
```jsx
<motion.button whileTap={{ scale: 0.95 }}>
```

### Pulse Animation
```jsx
<motion.div
  animate={{ opacity: [1, 0.5, 1] }}
  transition={{ duration: 1, repeat: Infinity }}
>
```

---

## 📱 Responsive Breakpoints

- `sm`: 640px
- `md`: 768px (masaüstü simülasyonu için)
- `lg`: 1024px
- `xl`: 1280px

### Mobil-First Yaklaşım
Uygulama mobil-first olarak tasarlanmıştır. Masaüstünde telefon çerçevesi içinde gösterilir (max-width: 430px).

---

## ♿ Erişilebilirlik

1. Tüm interaktif elemanlara `focus:ring` ekleyin
2. Renk kontrastı WCAG AA standardını karşılamalı
3. Touch targetlar minimum 44x44px olmalı
4. Animasyonlar `prefers-reduced-motion` için alternatif sunmalı

---

## 🌍 RTL (Sağdan Sola) Desteği

Arapça ve Farsça dilleri için:
```jsx
<ArrowLeft className="w-5 h-5 rtl-flip" />  /* Otomatik yansıtma */
```

```css
.rtl-flip {
  [dir="rtl"] & {
    transform: scaleX(-1);
  }
}
```
