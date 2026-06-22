import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Type, Layers, Eye, BookOpen, Share2, Wand2, ShieldCheck, Clock, Users, ArrowLeft } from "lucide-react";

const features = [
  { icon: Wand2, title: "استراتيجية علامة متكاملة", description: "من الـBrand Brief إلى الرؤية والرسالة والقيم وشخصية العلامة ونبرة الصوت — كل شيء مولّد بالذكاء الاصطناعي وقابل للتعديل." },
  { icon: Layers, title: "ثلاثة اتجاهات بصرية", description: "ليس اتجاهًا واحدًا. نولّد ثلاثة اتجاهات متمايزة مع وصف كامل للألوان والخطوط والصور والأشكال، لتختار الأنسب." },
  { icon: Palette, title: "لوحات ألوان ذكية", description: "11 لونًا لكل لوحة مع فحص WCAG للتباين، تصدير CSS Variables، ونسخ القيم بضغطة واحدة." },
  { icon: Type, title: "خطوط عربية وإنجليزية", description: "اقتراح خطوط مرخصة مع معاينات فعلية باستخدام اسم مشروعك، IBM Plex Sans Arabic، Alexandria، Manrope، والمزيد." },
  { icon: Eye, title: "Mood Boards", description: "ارفع صورك المرجعية أو ولّد صورًا جديدة بالذكاء الاصطناعي، رتّبها بالسحب والإفلات، وصدّرها بجودة عالية." },
  { icon: BookOpen, title: "Brand Book احترافي", description: "25 قسمًا قابلًا للتخصيص: الغلاف، القصة، الألوان، الخطوط، الاستخدام الصحيح والخاطئ، Design Tokens، والمزيد." },
  { icon: Share2, title: "بوابة عميل آمنة", description: "شارك المشروع مع عميل برابط آمن، كلمة مرور اختيارية، صلاحيات دقيقة، تعليقات، اعتمادات، وطلبات تعديل." },
  { icon: ShieldCheck, title: "عربي RTL أولًا", description: "بُنيت من الصفر للسوق العربي: واجهة RTL، خطوط عربية، تصدير PDF عربي A4، مع بنية قابلة لدعم الإنجليزية." },
  { icon: Clock, title: "من ساعات إلى دقائق", description: "بدل أسابيع من البحث والتنسيق، احصل على نظام هوية متكامل جاهز للمراجعة خلال دقائق." },
];

const steps = [
  { n: "١", title: "أنشئ مشروعًا", description: "عبّئ Brand Brief متعدد الخطوات مع حفظ تلقائي واستكمال لاحق." },
  { n: "٢", title: "ولّد الاستراتيجية", description: "الذكاء الاصطناعي يحلل مشروعك ويولّد رؤية ورسالة وقيم وشخصية كاملة." },
  { n: "٣", title: "اختر اتجاهًا بصريًا", description: "قارن ثلاثة اتجاهات، اختر الأنسب، ثم ولّد الألوان والخطوط والمود بورد." },
  { n: "٤", title: "صدّر وشارك", description: "Brand Book PDF عربي، Design Tokens JSON، وشارك مع العميل للاعتماد." },
];

const useCases = [
  { icon: Users, title: "للمصممين المستقلين", points: ["تقليل وقت البحث والتقديم", "Mood Boards سريعة", "Brand Sheet جاهز للعميل", "بوابة مراجعة احترافية"] },
  { icon: Sparkles, title: "لأصحاب المشاريع", points: ["فهم شخصية المشروع قبل التوظيف", "اختيار اتجاه بسهولة", "ألوان وخطوط منسجمة", "Brand Sheet جاهز"] },
  { icon: BookOpen, title: "للوكالات", points: ["Workspaces متعددة", "أعضاء فريق وصلاحيات", "عملاء متعددون", "تقارير استخدام وأرشيف"] },
];

export default async function Home() {
  const session = await auth();
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-coral/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center sm:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" />
            مدعوم بالذكاء الاصطناعي · عربي RTL أولًا
          </div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-balance sm:text-7xl">
            من فكرة إلى <span className="text-gradient-violet">هوية تُعرَف</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl leading-relaxed">
            سِمَة منصة متكاملة لبناء أنظمة الهوية البصرية — استراتيجية، اتجاهات بصرية، ألوان، خطوط، Mood Boards، شعارات، Brand Book، وبوابة عميل. كل ذلك خلال دقائق.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {session ? (
              <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />} className="min-w-44">الذهاب إلى لوحة التحكم<ArrowLeft className="size-4" /></Button>
            ) : (
              <>
                <Button size="lg" nativeButton={false} render={<Link href="/register" />} className="min-w-44">ابدأ مجانًا<ArrowLeft className="size-4" /></Button>
                <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/pricing" />} className="min-w-44">عرض الأسعار</Button>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">لا حاجة لبطاقة ائتمان · خطة مجانية متاحة</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight">كل ما تحتاجه لبناء هوية</h2>
          <p className="mt-3 text-lg text-muted-foreground">٩ مزايا إنتاجية جاهزة، ليست مجرد مولّد شعارات</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-premium p-6 group">
              <div className="size-12 rounded-xl bg-violet/10 flex items-center justify-center mb-4 group-hover:bg-violet/20 transition-colors">
                <f.icon className="size-6 text-violet" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-transparent via-violet/5 to-transparent py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">كيف تعمل سِمَة</h2>
            <p className="mt-3 text-lg text-muted-foreground">أربع خطوات من الفكرة إلى الهوية المعتمدة</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div className="size-24 rounded-full border-2 border-violet/30 bg-card flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-violet">{s.n}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight">لمن صُممت سِمَة</h2>
          <p className="mt-3 text-lg text-muted-foreground">للمصممين وأصحاب المشاريع والوكالات</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {useCases.map((u) => (
            <div key={u.title} className="card-premium p-6">
              <div className="size-12 rounded-xl bg-coral/10 flex items-center justify-center mb-4">
                <u.icon className="size-6 text-coral" />
              </div>
              <h3 className="text-lg font-semibold mb-4">{u.title}</h3>
              <ul className="space-y-2">
                {u.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-violet mt-1.5 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="card-premium bg-gradient-to-br from-violet/10 via-card to-coral/5 p-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">جاهز لبناء هويتك؟</h2>
          <p className="mt-3 text-lg text-muted-foreground mb-8">ابدأ الآن بمجرد إنشاء حساب. لا حاجة لبطاقة ائتمان.</p>
          <div className="flex justify-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>ابدأ مجانًا<ArrowLeft className="size-4" /></Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/pricing" />}>عرض الأسعار</Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 mt-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-violet to-violet-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">س</span>
              </div>
              <span className="font-semibold">سِمَة — SEMAH</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SEMAH AI Brand Studio · صُنع للمبدعين العرب</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
