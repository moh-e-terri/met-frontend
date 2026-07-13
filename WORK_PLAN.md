# خطة عمل مشروع MET E-Academy

> هذا الملف مرجع دائم لكل التعليمات، القواعد، والتعديلات المطلوبة.  
> **يجب تحديثه بعد كل طلب جديد من المستخدم** حتى لا تُنسى أي متطلبات مستقبلية.

آخر تحديث: 2026-06-02 (إصلاح Grid لوحة التحكم)

---

## 1) إعداد Figma MCP

### تفعيل Figma MCP في Cursor

**الطريقة المفضلة:**
```
/add-plugin figma
```

**أو يدوياً:**
1. `Cursor Settings` → `MCP` → `Add new MCP server`
2. أضف:
```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```
3. اضغط **Connect** → **Allow access**
4. تأكد أن الحالة **خضراء**

> إذا الـ remote لم يعمل: Desktop MCP من Figma → `http://127.0.0.1:3845/mcp`

### تجهيز ملف Figma قبل كل مهمة

| المطلوب | السبب |
|---|---|
| رابط Figma مع `node-id` | قراءة العقدة الصحيحة |
| Frame واحد واضح لكل سكشن | منع أبعاد خاطئة |
| أسماء طبقات واضحة | مطابقة ملفات الكود |
| تصدير SVG/PNG من Figma | حفظها في `public/images/` |
| ألوان خلفية ثابتة | عدم تخمين التدرجات |
| RTL مفعّل في Figma | مطابقة الموقع العربي |

**صيغة الرابط:**
```
https://www.figma.com/design/SNgr4WKT7Qz94cJ0CqQcpd/...?node-id=1-528
```

### طريقة العمل

- **سكشن سكشن** — لا تُنفَّذ الصفحة كاملة دفعة واحدة
- الترتيب المقترح: `Navbar` → `Hero` → `WhyMet` → باقي السكاشن → صفحات الطالب
- بعد كل سكشن: مقارنة بصرية مع Figma
- **لا تعدّل `viewBox` في SVG يدوياً** — يفسد الظلال والمقاسات
- **إلزامي:** قبل أي صفحة طالب جديدة أو مقارنة/تعديل — استدعِ `get_design_context` من Figma MCP أولاً. لا تبني من الذاكرة أو من صفحات أخرى.

---

## 2) البرومبت الرئيسي (مرجع التنفيذ)

```text
نفّذ سكشن [اسم السكشن] من Figma إلى كود مطابق 1:1 في مشروع MET E-Academy.

## مصدر التصميم
- Figma URL: [الرابط الكامل مع node-id]
- Node: [مثلاً Hero Section / Why MET / Student Home]
- قارن النتيجة مع screenshot من Figma قبل الإنهاء

## التقنيات (لا تغيّرها)
- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (classes فقط)
- React Router v7
- shadcn Button من `@/shared/ui/button` للأزرار إن أمكن

## هيكلية المشروع
- الموقع العام: `src/website/`
- صفحة الهوم: `src/website/modules/home/views/HomePage.tsx`
- كل سكشن: `src/website/modules/home/components/[SectionName].tsx`
- لوحة الطالب: `src/student/`
- الأصول: `public/images/`
- الستايل العام: `src/styles/global.css`

## قواعد RTL (حرجة — لا تُخالَف أبداً)
- الموقع عربي RTL على **كل** الصفحات
- `dir="rtl"` على كل حاوية تحتوي نصاً عربياً
- النص: `text-right` حيث يلزم
- **ترتيب العناصر:** من اليمين إلى اليسار دائماً (نص، محتوى، أيقونات، أعمدة)
- **responsive:** المحتوى الرئيسي يظهر **أولاً** على الشاشات الصغيرة (أعلى الصفحة)، والعمود الجانبي ثانياً
- **شبكة عمودين (مهم — لا تُكسر):** انظر قسم «تخطيط عمودين» أدناه
- **ممنوع:** وضع الـ sidebar/widgets قبل المحتوى الرئيسي على الجوال
- الهيدر العام: الشعار يمين (أول عنصر DOM)، زر الدخول يسار
- الهيرو: النص يمين، الصورة يسار
- `items-start` لمحاذاة أعلى النص مع أعلى الصورة

## Design Tokens
- خلفية الهيرو: `#f8f7f5`
- خلفية بيضاء: `#ffffff`
- نص أساسي: `#0f172a`
- برتقالي أساسي: `#f5a524`
- نص ثانوي: `#64748b`
- خط: `Noto Sans Arabic`
- Container: `1120px` للسكاشنات العامة
- أعمدة الهيرو: `536px` نص + `536px` صورة + `gap 48px`

## قواعد الأصول
1. استخدم `get_design_context` من Figma MCP أولاً
2. حمّل SVG/صور Figma إلى `public/images/`
3. لا Unsplash ولا placeholders
4. لا تعدّل `viewBox` في SVG
5. صورة الهيرو: `hero-student.svg` كما هي من Figma

## ممنوعات
- لا إعادة كتابة الصفحة كاملة
- لا تعديل سكاشن غير مطلوبة
- لا تخمين ألوان/أحجام
- لا مكتبات جديدة بدون طلب
- لا commit إلا بطلب صريح

## معايير القبول
- [ ] نفس الترتيب الفيزيائي مثل Figma
- [ ] ألوان وخطوط وأحجام قريبة pixel-perfect
- [ ] أصول من Figma وليس بدائل
- [ ] responsive على الجوال والتابلت والديسكتوب
- [ ] لا أخطاء lint
```

---

## 3) قواعد خاصة بلوحة الطالب (Student Dashboard)

> **Figma:** `node-id=179-749` — Student Home

### قواعد إلزامية (طلب المستخدم الصريح)

1. **RTL دائماً** — اتجاه الكلام وموضع الأيقونات **كما في Figma**
2. **SVG فقط** — لا Lucide ولا أيقونات عامة في صفحات الطالب
3. استخدم `StudentIcon` + ملفات `public/images/student/*.svg`
4. صور المساقات: SVG من Figma — `course-js.svg`, `course-data.svg`, `course-web.svg`
5. الأفاتار:
   - الطالب المسجّل: `avatar-student-default.svg` عبر `STUDENT_DEFAULT_AVATAR` في `src/student/constants/assets.ts`
   - مستخدمون آخرون: `avatar-user-1.svg` … `avatar-user-5.svg`
   - صورة البوست: `post-chart.svg`

### تخطيط الصفحة

| العنصر | القاعدة |
|---|---|
| **الهيدر (Navbar)** | مشترك عبر `StudentLayout` لكل صفحات الطالب — على امتداد محتوى الصفحة فقط |
| **السايدبار** | طبقة `fixed` فوق الـ Navbar (`z-60`)، ارتفاع كامل، ظل جانبي، ثابت عند التمرير |
| **زر تسجيل الخروج** | ثابت أسفل السايدبار (قاع الشاشة) |
| **Toggle** | زر في الهيدر لإظهار/إخفاء السايدبار على كل الشاشات |
| **جوال/تابلت** | السايدبار drawer + overlay **من تحت الهيدر فقط**؛ يُغلق عند التنقل |
| **ديسكتوب (lg+)** | السايدبار مفتوح افتراضياً؛ المحتوى يأخذ `lg:mr-64` عند الفتح |

### قواعد السايدبار والهيدر (مهمة — لا تُكسر)

1. **السايدبار طبقة فوق Navbar** — `z-index: 60` | Navbar: `40` | Overlay جوال: `50`
2. السايدبار `fixed` بارتفاع `100dvh` من أعلى الشاشة مع `padding-top` داخلي = ارتفاع الهيدر
3. **ثابت عند التمرير** + زر الخروج أسفل الشاشة + المحتوى `lg:mr-64`
2. استخدم متغير CSS موحّد: `--student-header-height: 65px` من `src/student/constants/layout.ts`
3. الهيدر: `z-50` | السايدبار: `z-40` | Overlay: `z-30` (كلها **تحت** الهيدر بصرياً)
4. Overlay على الجوال: `top: var(--student-header-height)` — **ليس** `inset-0` كامل الشاشة
5. ارتفاع السايدبار: `calc(100dvh - headerHeight)` — يُطبَّق بـ `style` inline لضمان عدم فشل CSS variable
6. زر تسجيل الخروج يبقى ثابتاً أسفل السايدبار (قاع منطقة السايدبار)

### تخطيط Navbar الطالب (مشترك — Figma)

> `StudentHeader` + `StudentSidebar` عبر `StudentLayout` — يُطبَّقان على **كل** صفحات `/student/*`

1. صف الـ Navbar بـ `dir="ltr"` لضبط اليمين/اليسار الفيزيائي بدقة
2. **يمين الشاشة:** `logo` ثم `toggle` (الـ toggle أقصى اليمين — على يمين الشعار)
3. **يسار الشاشة:** `avatar` → `الاسم` → `رسائل` → `إشعارات`
4. نص الاسم والوظيفة: `dir="rtl"` + `text-right` داخل عنصره
5. لا تعتمد على `dir="rtl"` للصف الرئيسي في الهيدر — يسبب انعكاس المواضع

### مواضع العناصر (RTL)

- **الهيدر:** يمين فيزيائي = شعار + toggle (toggle أقصى اليمين) | يسار فيزيائي = صورة + اسم + رسائل + إشعارات
- **السايدبار:** الأيقونة **يمين** النص
- **بطاقة الملف:** خلفية بيضاء | صورة يمين | زر التعديل يسار
- **الإحصائيات:** الأيقونة يمين | النص والرقم بجانبها (`flex-1 text-right`) | الأرقام `dir="ltr"`
- **متابعة التعلم:** عنوان يمين مع أيقونة | رابط يسار
- **المجتمع:** التفاعلات يمين (عمود واسع) | الإحصائيات يسار (عمود ضيق)

### تخطيط عمودين (Grid — إلزامي لصفحات المجتمع ولوحة التحكم)

> **مرجع صحيح:** `StudentCommunityPage.tsx` و `CommunitySection.tsx`

**الهدف:** المحتوى الرئيسي **يمين** والـ sidebar/widgets **يسار**، وكلاهما يبدأ من **أعلى الصف** (لا فراغ علوي في العمود الجانبي).

**القالب المعتمد (انسخه — لا تخترع بديلاً):**

```tsx
<section
  className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"
  dir="ltr"
>
  <aside className="order-2 lg:order-1 lg:row-start-1">
    {/* sidebar / widgets */}
  </aside>
  <div className="order-1 min-w-0 lg:order-2 lg:row-start-1" dir="rtl">
    {/* المحتوى الرئيسي */}
  </div>
</section>
```

**قواعد صارمة:**
1. **`items-start`** — محاذاة الأعمدة من الأعلى (ممنوع ترك الـ sidebar ينزل لأسفل)
2. **`dir="ltr"`** على الـ grid فقط — العمود الأول فيزيائياً يسار، الثاني يمين
3. **`order-1` للمحتوى / `order-2` للـ sidebar** على الجوال — المحتوى أولاً
4. **`lg:order-1` للـ sidebar / `lg:order-2` للمحتوى** — ترتيب الأعمدة على الديسكتوب
5. **`lg:row-start-1` على كلا العمودين** — نفس الصف دائماً
6. **ممنوع `col-start-1` / `col-start-2`** مع ترتيب DOM معكوس — يدفع الـ sidebar للصف الثاني (خطأ شائع)
7. عناوين الأقسام: `dir="rtl"` + `justify-start` (ليس `justify-end`)
8. رأس المنشور: صورة + اسم **يمين** | وقت/قائمة `···` **يسار** — في `header` مستقل بـ `dir="rtl"`

### تخطيط ثلاثة أعمدة (صفحة المحادثات — Figma `44:2`)

> **مرجع:** `StudentChatsPage.tsx`

**الهدف:** قائمة الدردشات **يمين** | نافذة المحادثة **وسط** | ملف المستخدم **يسار** — كلها من **أعلى** الصف.

```tsx
<div
  className="grid grid-cols-1 items-start xl:grid-cols-[280px_minmax(0,1fr)_320px]"
  dir="ltr"
>
  <div className="order-3 hidden xl:order-1 xl:block xl:row-start-1">{/* profile */}</div>
  <div className="order-2 min-w-0 xl:order-2 xl:row-start-1">{/* chat */}</div>
  <div className="order-1 xl:order-3 xl:row-start-1">{/* list */}</div>
</div>
```

**قواعد إضافية:**
- الهيدر يعرض «مركز الرسائل» في الوسط عند `/student/chats`
- الرسائل الواردة يمين (أبيض) | الصادرة يسار (برتقالي)
- زر الإرسال يسار حقل الإدخال | أيقونات المرفقات يمين الحقل
- **ممنوع `col-start`** — نفس خطأ عمودين

### Responsive breakpoints

| الشاشة | السلوك |
|---|---|
| `< sm` | عمود واحد، padding أصغر، بطاقة الملف عمودية |
| `sm–md` | إحصائيات 2 أعمدة، دورات 2 أعمدة |
| `lg+` | سايدبار ثابت، دورات 3 أعمدة، مجتمع عمودين |
| Toggle | يعمل على **كل** المقاسات |

### هيكلية الملفات

```
src/student/
  constants/layout.ts
  layouts/StudentLayout.tsx
  routes/StudentRouter.tsx
  modules/
    dashboard/
      components/StudentHeader.tsx, StudentSidebar.tsx, StudentIcon.tsx, ...
      views/StudentHomePage.tsx
    payments/
      components/PaymentPageHeader.tsx, PaymentSummaryCards.tsx, ...
      views/StudentPaymentsPage.tsx
```

---

## 4) حالة التنفيذ — الموقع العام

| السكشن | Node ID | الحالة | الملف |
|---|---|---|---|
| Navbar | `1:756` | ✅ منفّذ | `Navbar.tsx` |
| Hero | `1:528` | ✅ منفّذ | `HeroSection.tsx` |
| Why MET | `1:318` | ✅ منفّذ | `WhyMetSection.tsx` / `StatsSection.tsx` |
| Features | `1:362` | ⏳ قيد الانتظار | — |
| Journey | — | ⏳ قيد الانتظار | — |
| Tracks | — | ⏳ قيد الانتظار | — |
| Testimonials | — | ⏳ قيد الانتظار | — |
| FAQ | — | ⏳ قيد الانتظار | — |
| Final CTA | — | ⏳ قيد الانتظار | — |

---

## 5) حالة التنفيذ — لوحة الطالب

| العنصر | الحالة | ملاحظات |
|---|---|---|
| Student Layout + Router | ✅ | |
| Student Header | ✅ | مشترك — تخطيط LTR فيزيائي |
| Student Sidebar | ✅ | مشترك — fixed + logout أسفل الشاشة |
| Profile Card | ✅ | SVG أفاتار من Figma |
| Stats Cards | ✅ | RTL للنص والأرقام |
| Continue Learning | ✅ | صور SVG المساقات من Figma |
| Community Section | ✅ | |
| Responsive (جوال/تابلت) | ✅ | |
| صفحة المدفوعات | ✅ | Figma `28:774` — `/student/payments` و `/student/pay` |
| صفحة المحادثات | ✅ | Figma `44:2` — `/student/chats` |
| صفحة الكورس | ✅ | Figma `50:383` — `/student/courses/:courseId` |
| صفحة My Courses | ✅ | Figma `52:599` — `/student/my-courses` |
| صفحة المجتمع | ✅ | `/student/community` — أُعيد بناؤها لمطابقة Figma |
| زر الإشعارات | ✅ | لوحة منبثقة + تعليم كمقروء |

---

## 6) سجل التعديلات والطلبات

### 2026-06-02 — Figma MCP + Home Sections
- تفعيل Figma MCP والتحقق منه
- تنفيذ Navbar (`1:756`), Hero (`1:528`), Why MET (`1:318`)
- قواعد RTL للهيرو والسكاشنات

### 2026-06-02 — Student Home (`179:749`)
- بناء هيكلية `src/student/`
- إنشاء `StudentIcon` مع `mask-image` للتلوين الديناميكي
- استبدال Lucide بـ SVG من `public/images/student/`
- ضبط RTL لكل المكوّنات

### 2026-06-02 — تصحيحات المستخدم
- التزام صارم بـ RTL وموضع الأيقونات كما في Figma
- SVG فقط — ممنوع placeholders أو مكتبات أيقونات
- إضافة صور المساقات SVG من Figma
- إصلاح اتجاه الأرقام والكلام في بطاقات الإحصائيات
- السايدبار fixed على الجنب + زر الخروج بقاع الشاشة

### 2026-06-02 — إصلاح لوحة التحكم (CommunitySection)
- **سبب:** نفس خطأ `col-start` — الـ sidebar نزل لأسفل بدل المحاذاة العلوية
- **الحل:** نفس قالب Grid المعتمد في صفحة المجتمع (`items-start` + `order` + `row-start-1`)
- **HomeCommunityPostCard:** صورة + اسم يمين، الوقت يسار
- **CommunitySidebarPanel:** تسميات الإحصائيات يمين، الأرقام يسار
- **WORK_PLAN.md:** قسم «تخطيط عمودين» مع القالب الكامل وقائمة الممنوعات

### 2026-06-02 — مطابقة قوائم المجتمع الجانبية (Figma)
- **مجموعات شائعة:** أيقونات ملوّنة (كود/قاعدة بيانات/درع) + شارة العدد + ترتيب RTL
- **مواضيع متصدرة:** `#أسئلة_الاختبارات` مميز + شبكة 2×2 للباقي بالترتيب الصحيح
- **أعضاء نشطون:** أفاتار + نقطة حالة (أخضر/رمادي) + رابط «متابعة» نصي
- عناوين الأقسام مع أيقونات برتقالية من Figma

### 2026-06-02 — أصول المجتمع + RTL صارم
- حفظ SVG من المستخدم: `post-chart.svg`, `avatar-student-default.svg`, `avatar-user-1..5.svg`
- ثابت `STUDENT_DEFAULT_AVATAR` — يُستخدم في الهيدر، الملف الشخصي، composer
- أفاتار مختلف لكل منشور/عضو في المجتمع
- إصلاح ترتيب الأعمدة: المحتوى الرئيسي يمين/أولاً، الـ widgets يسار/ثانياً
- قاعدة RTL محدّثة: ترتيب من اليمين لليسار على كل الشاشات

### 2026-06-02 — إعادة بناء صفحة المجتمع (مطابقة Figma)
- **سبب:** الصفحة السابقة كانت مختلفة تماماً (hero + widgets من الرئيسية بدل تصميم Figma)
- **قاعدة جديدة:** قراءة Figma MCP إلزامية قبل كل صفحة جديدة أو مقارنة
- **التخطيط:** عمود يسار (مجموعات شائعة، مواضيع متصدرة، أعضاء نشطون) + عمود وسط (composer + feed)
- **الهيدر:** بحث «بحث في المجتمع...» يظهر في Navbar عند `/student/community` فقط
- **Composer:** «اكتب سؤالاً أو شارك فكرة...» + أزرار صورة/ملف/سؤال + نشر
- **المنشورات:** أحمد محمد (مع صورة) + د. ليلى حسن — حسب Figma
- **حُذف:** `CommunityPageHeader` (hero غير موجود في Figma)
- Figma node: بانتظار التأكيد (MCP rate limit)

### 2026-06-02 — صفحة المجتمع + الإشعارات (النسخة الأولى — مُستبدَلة)
- `/student/community`: عنوان، منشور جديد، composer، feed، sidebar
- تفعيل زر الإشعارات: لوحة منبثقة، عداد غير مقروء، تعليم كمقروء
- `NotificationsPanel` بـ `z-70` فوق Navbar و Sidebar

### 2026-06-02 — السايدبار كطبقة فوق Navbar
- Sidebar `z-60` فوق Navbar `z-40` مع ظل جانبي
- ارتفاع كامل `100dvh` — المحتوى يبدأ بعد الهيدر داخلياً (`padding-top: 65px`)

### 2026-06-02 — السايدبار ثابت عند التمرير
- إزالة `lg:static` — السايدبار `fixed` دائماً عند الفتح
- يبدأ بعد Navbar + زر الخروج ثابت أسفل الشاشة
- المحتوى: `lg:mr-64` عند فتح السايدبار

### 2026-06-02 — صفحة My Courses (Figma `52:599`)
- **المسار:** `/student/my-courses`
- **الأقسام:** بطاقة الكورس | فيديوهات/اختبارات/تكليفات | ويدجتات يسار + نقاشات يمين
- **الهيدر:** بحث «بحث عن كورسات أو زملاء...»
- **مكوّنات:** `MyCourseHeroCard`, `MyCourseVideosCard`, `MyCourseQuizzesCard`, `MyCourseAssignmentsCard`, `MyCourseSidebarWidgets`, `MyCourseFeed`

### 2026-06-02 — صفحة الكورس (Figma `50:383`)
- **المسار:** `/student/courses/:courseId` (مثال: `js-masterclass`)
- **الأقسام:** بانر الدورة | قائمة محاضرات يسار | فيديو + تفاصيل + نقاشات يمين | فوتر
- **المكوّنات:** `CourseHeroBanner`, `CourseLessonsSidebar`, `CourseVideoPlayer`, `CourseLessonDetails`, `CourseDiscussions`, `CoursePageFooter`
- **Grid:** `order` + `row-start-1` — المحتوى أولاً على الجوال
- ربط «متابعة التعلم» من الرئيسية بصفحة الكورس

### 2026-06-02 — صفحة المحادثات (Figma `44:2`)
- **المسار:** `/student/chats`
- **التخطيط:** 3 أعمدة — ملف المستخدم يسار | محادثة وسط | قائمة دردشات يمين
- **الهيدر:** «مركز الرسائل» في الوسط
- **المكوّنات:** `ChatsListPanel`, `ChatWindow`, `ChatContactProfile`
- **قواعد Grid:** `order` + `row-start-1` بدون `col-start`
- **أيقونات جديدة:** send, phone, video, info, emoji, attach, block, university, major, media

### 2026-06-02 — إعادة بناء صفحة وسائل الدفع (Figma `28:774`)
- **سبب:** الصفحة السابقة (إحصائيات + بطاقات محفوظة) لا تطابق Figma
- **التخطيط:** عنوان → اختيار طريقة دفع (3 بطاقات) → عمودين (ملخص يسار + نموذج بطاقة يمين) → سجل العمليات
- **طرق الدفع:** PayPal (محدد) | بطاقة بنكية | Apple Pay
- **النموذج:** الاسم، رقم البطاقة، تاريخ الانتهاء، CVV، زر تأكيد برتقالي
- **ملخص الاشتراك:** كورس JS + أسعار + زر «إتمام الدفع» أخضر مائي + SECURE CHECKOUT
- **السجل:** #TRX-9821 و #TRX-7742 — حالة «مكتمل»
- **مكوّنات جديدة:** `PaymentMethodSelector`, `PaymentCardForm`, `OrderSummarySidebar`
- **حُذف:** `PaymentSummaryCards`, `SavedPaymentMethods`

### 2026-06-02 — صفحة وسائل الدفع (Payments — نسخة قديمة مُستبدَلة)
- المسار: `/student/payments` و `/student/pay`
- الهيكلية: `src/student/modules/payments/`
- الأقسام: عنوان + إحصائيات + بطاقات محفوظة + سجل مدفوعات
- SVG جديد: wallet, add, download, receipt, visa, mastercard
- RTL + `StudentIcon` + نفس أنماط لوحة الطالب
- Figma node: بانتظار التأكيد (MCP rate limit)

### 2026-06-02 — إصلاح موضع السايدبار + ترتيب Toggle
- السايدبار: `top` و `height` بـ inline style من `STUDENT_HEADER_HEIGHT` (65px)
- Toggle على يمين الشعار (أقصى اليمين): ترتيب `logo` → `toggle`

### 2026-06-02 — تخطيط Navbar الطالب (يمين/يسار فيزيائي)
- صف الهيدر `dir="ltr"` لمحاذاة ثابتة على كل الشاشات
- يمين: toggle + شعار | يسار: avatar + اسم + رسائل + إشعارات
- Navbar و Sidebar مشتركان عبر `StudentLayout` لكل صفحات الطالب

### 2026-06-02 — السايدبار يبدأ بعد الـ Navbar
- توحيد ارتفاع الهيدر عبر `--student-header-height` في `src/student/constants/layout.ts`
- السايدبار: `top-[var(--student-header-height)]` — لا يغطي الـ Navbar
- Overlay الجوال يبدأ من تحت الهيدر فقط (الهيدر يبقى ظاهراً وقابلاً للنقر)
- ترتيب z-index: Header (50) > Sidebar (40) > Overlay (30)

### 2026-06-02 — Navbar + Responsive + Toggle
- الهيدر على امتداد محتوى الصفحة فقط (داخل عمود المحتوى)
- زر toggle لإظهار/إخفاء السايدبار على كل الشاشات
- جوال: drawer + overlay + قفل scroll
- تابلت: شبكات 2 أعمدة للإحصائيات والدورات
- إنشاء/تحديث `WORK_PLAN.md`

---

## 7) مهام قادمة (Backlog)

- [ ] Features Section (`1:362`)
- [ ] Journey, Tracks, Testimonials, FAQ, Final CTA
- [x] `/student/payments` + `/student/pay`
- [x] `/student/my-courses` (Figma `52:599`)
- [x] `/student/community` (أُعيد بناؤها 2026-06-02)
- [ ] مقارنة pixel-perfect نهائية مع Figma لكل صفحة
- [ ] تحديث هذا الملف بعد كل طلب جديد

---

## 8) برومبتات جاهزة للنسخ

### سكشن عام
```text
طبّق برومبت MET E-Academy على [اسم السكشن].
Figma URL: [رابط مع node-id]
عدّل [SectionName].tsx فقط.
استخدم get_design_context أولاً.
قارن مع Figma قبل الإنهاء.
```

### صفحة طالب
```text
نفّذ [اسم الصفحة] من Figma node-id=[ID] في src/student/.
التزم بـ RTL + SVG فقط من public/images/student/.
السايدبار fixed يمين، الهيدر على امتداد المحتوى، toggle للقائمة.
حدّث WORK_PLAN.md بعد الانتهاء.
```

---

## 9) تعليمات للـ Agent

عند كل طلب جديد من المستخدم:

1. نفّذ التعديل في الكود
2. **حدّث `WORK_PLAN.md`**:
   - أضف الطلب في «سجل التعديلات»
   - حدّث جدول الحالة
   - أضف قواعد جديدة إن وُجدت
3. لا تنسَ قواعد RTL وSVG في صفحات الطالب
4. لا commit إلا بطلب صريح
