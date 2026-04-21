import Image from 'next/image';
import styles from './Hero.module.css';
const ASSETS = {
  logo: "/hero-logo.png",
  heroCard: "/background.png",
  featured: "/video.png",
};

const statPills = ["+580 PT", "+420 PT", "+410 PT", "+390 PT", "+380 PT"];

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden rounded-b-[28px] bg-cover bg-center bg-no-repeat px-4 pb-10 pt-10 text-white min-h-full lg:h-[85vh] sm:px-6 lg:rounded-b-[40px] lg:px-10 lg:pb-14 lg:pt-14"
    style={{ backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-5 lg:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3b74f666] bg-[#3b74f620] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73a4ff]">
              <span className="h-2 w-2 rounded-full bg-[#3b74f6]" />
              Limited Spots Available
            </div>

            <img
              src={ASSETS.logo}
              alt="Program logo placeholder"
              className="h-auto w-full max-w-[280px] object-contain sm:max-w-[360px]"
            />

            <div className="max-w-xl space-y-3">
              <h1 className="font-['Norwester',sans-serif] text-4xl uppercase leading-[1.05] tracking-wide sm:text-5xl">
                SAT Scholarship Program
              </h1>
              <p className="text-[15px] leading-7 text-white/70 sm:text-base">
                A fully-funded SAT preparation opportunity for your district&apos;s
                highest-potential students.{" "}
                <span className="text-white/95">
                  No cost. No obligation. No long-term commitment.
                </span>
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[#004eff] px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.24)] transition hover:bg-[#0e5dff]"
            >
              Reserve Your Spots
              <span aria-hidden="true">›</span>
            </button>

        
          </div>

          <div className="space-y-4 self-end">
          <div className='hidden lg:block'>
            <Image
              src="/hero-spinner.png"
              alt="Featured video placeholder"
              width={400}
              height={400}
              className={styles.spinner}
              style={{ position: "absolute", top: "-5%", right: "-12%" }}
            />  
          </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src={ASSETS.featured}
                alt="Featured video placeholder"
                className="h-[250px] w-full object-cover sm:h-[320px] lg:h-[380px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131d45] via-[#111a40c7] to-transparent" />

              <button
                type="button"
                className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-white text-[#004eff] shadow-xl"
                aria-label="Play video"
              >
                ▶
              </button>

              <div className="absolute inset-x-0 bottom-0 space-y-1 px-5 pb-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">
                  Program Overview
                </p>
                <h2 className="font-['Norwester',sans-serif] text-2xl uppercase leading-none tracking-wide sm:text-[32px]">
                  See How Students Transform
                </h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="font-['Norwester',sans-serif] text-[40px] leading-none tracking-wide">
                  178<span className="text-[#3b74f6]">+</span>
                </p>
                <p className="mt-1 text-xs text-white/60">Average Point Gain</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="font-['Norwester',sans-serif] text-[40px] leading-none tracking-wide">
                  Top 2%
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Private clients achieve top 2% scores
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
            Scroll
          </p>
          <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
