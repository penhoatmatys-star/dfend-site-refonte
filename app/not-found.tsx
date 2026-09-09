import type { Metadata } from "next";
import BrandButton from "@/components/brand-button";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <section className="on-lime bg-lime py-[clamp(56px,8vw,104px)] text-ink">
        <div className="wrap">
          <p className="label">error 404</p>
          <h1 className="mt-s3">This page moved.</h1>
          <p className="lede mt-s4">
            The address you followed does not exist on this site.
          </p>
        </div>
      </section>

      <section className="ground">
        <div className="wrap">
          <h2 data-reveal>Everything else is one click away.</h2>
          <div className="mt-s4 flex flex-wrap items-center gap-s3 gap-x-s4" data-reveal>
            <BrandButton href="/">go to the home page</BrandButton>
            <BrandButton href={`mailto:${SITE.email}`} skin="ghost" external>
              tell us what you were looking for
            </BrandButton>
          </div>
        </div>
      </section>
    </>
  );
}
